import mongoose from 'mongoose';
import Registration from './models/Registration.js';
import Event from './models/Event.js';
import ClubHead from './models/ClubHead.js';
import TeamRequest from './models/TeamRequest.js';
import JoinRequest from './models/JoinRequest.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const clubId = "6a117dea9de2ce80c3b351cd"; // E-Cell
  
  const clubHead = await ClubHead.findById(clubId).lean();
  if(!clubHead) {
    console.log("Not found");
    return mongoose.disconnect();
  }
  
  const cName = (clubHead.clubName || '').trim().toLowerCase();
  
  const clubEvents = await Event.find({}).lean();
  const myEvents = clubEvents.filter(e => (e.clubName || '').trim().toLowerCase() === cName);
  const myEventIds = myEvents.map(e => String(e._id));
  
  const approved = myEvents.filter(e => e.status === 'approved');
  const pending = myEvents.filter(e => e.status === 'pending');
  const rejected = myEvents.filter(e => e.status === 'rejected');
  
  const myRegistrations = await Registration.find({}).populate('teamId').lean();
  const clubRegs = myRegistrations.filter(r => myEventIds.includes(String(r.eventId._id || r.eventId)));
  
  let totalParticipants = 0;
  let uniqueStudents = new Set();
  
  clubRegs.forEach(reg => {
    if (reg.participationType === 'Individual') {
       totalParticipants += 1;
       if(reg.studentId) uniqueStudents.add(String(reg.studentId._id || reg.studentId));
    }
    else if (reg.participationType === 'Team' && reg.teamId) {
      totalParticipants += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0);
      if(reg.teamId.createdBy) uniqueStudents.add(String(reg.teamId.createdBy._id || reg.teamId.createdBy));
      if(reg.teamId.currentMembers) {
         reg.teamId.currentMembers.forEach(mId => uniqueStudents.add(String(mId._id || mId)));
      }
    }
  });

  const registeredTeamsCount = clubRegs.filter(r => r.participationType === 'Team').length;
  
  const recentEvents = [...myEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(e => {
     const eId = String(e._id);
     const eRegs = clubRegs.filter(r => String(r.eventId._id || r.eventId) === eId);
     let eParts = 0;
     eRegs.forEach(reg => {
        if (reg.participationType === 'Individual') eParts += 1;
        else if (reg.participationType === 'Team' && reg.teamId) {
           eParts += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0);
        }
     });
     return { ...e, totalRegistrations: eRegs.length, totalParticipants: eParts };
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const creationCounts = {};
  myEvents.forEach(e => {
     const d = new Date(e.createdAt);
     const m = monthNames[d.getMonth()];
     creationCounts[m] = (creationCounts[m] || 0) + 1;
  });
  const monthlyCreation = Object.keys(creationCounts).map(month => ({ month, events: creationCounts[month] }));
  
  const timeline = [];
  myEvents.forEach(e => {
     timeline.push({ type: 'event_created', title: `Event Created: ${e.title}`, date: e.createdAt, eventId: e._id });
     if(e.status === 'approved') timeline.push({ type: 'event_approved', title: `Event Approved: ${e.title}`, date: e.updatedAt || e.createdAt, eventId: e._id });
     if(e.status === 'rejected') timeline.push({ type: 'event_rejected', title: `Event Rejected: ${e.title}`, date: e.updatedAt || e.createdAt, eventId: e._id });
  });
  clubRegs.forEach(r => {
     const e = myEvents.find(ev => String(ev._id) === String(r.eventId._id || r.eventId));
     const eTitle = e ? e.title : 'Unknown Event';
     if(r.participationType === 'Team') timeline.push({ type: 'team_registration', title: `Team Registration for ${eTitle}`, date: r.createdAt, eventId: e ? e._id : null });
     else timeline.push({ type: 'individual_registration', title: `Individual Registration for ${eTitle}`, date: r.createdAt, eventId: e ? e._id : null });
  });
  
  timeline.sort((a,b) => new Date(b.date) - new Date(a.date));
  const recentActivity = timeline.slice(0, 10);
  
  console.log("HEAD", clubHead.name);
  console.log("STATS", { events: myEvents.length, approved: approved.length, pending: pending.length, rejected: rejected.length, regs: clubRegs.length, parts: totalParticipants, unique: uniqueStudents.size, teams: registeredTeamsCount });
  console.log("TIMELINE", recentActivity.length);
  
  mongoose.disconnect();
});
