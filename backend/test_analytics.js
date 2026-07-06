import mongoose from 'mongoose';
import Registration from './models/Registration.js';
import Event from './models/Event.js';
import ClubHead from './models/ClubHead.js';
import TeamRequest from './models/TeamRequest.js';

import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");
  
  const allEvents = await Event.find({}).lean();
  const allRegistrations = await Registration.find({}).populate('teamId').lean();
  const clubHeads = await ClubHead.find({}).lean();
  
  const clubDataMap = {};
  for (const ch of clubHeads) {
    if (!ch.clubName) continue;
    const cName = ch.clubName.trim().toLowerCase();
    
    const clubEvents = allEvents.filter(e => (e.clubName || '').trim().toLowerCase() === cName).map(e => String(e._id));
    const uniqueStudents = new Set();
    const clubRegs = allRegistrations.filter(r => clubEvents.includes(String(r.eventId)));
    
    for (const reg of clubRegs) {
      if (reg.studentId) uniqueStudents.add(String(reg.studentId));
      if (reg.teamId) {
         if (reg.teamId.createdBy) uniqueStudents.add(String(reg.teamId.createdBy));
         if (reg.teamId.currentMembers) {
            reg.teamId.currentMembers.forEach(mId => uniqueStudents.add(String(mId)));
         }
      }
    }

    if (!clubDataMap[cName]) {
      clubDataMap[cName] = {
        id: ch._id,
        name: ch.clubName,
        head: ch.name,
        members: uniqueStudents.size,
        events: 0,
        status: 'Active',
        isArchived: ch.isArchived || false
      };
    }
  }

  for (const event of allEvents) {
    const cName = (event.clubName || '').trim().toLowerCase();
    if (cName && clubDataMap[cName]) {
      clubDataMap[cName].events += 1;
    }
  }

  const clubs = Object.values(clubDataMap);
  console.log("CLUBS LIST:");
  console.log(clubs);
  
  // Test aggregation
  const chartDataAgg = await Registration.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $lookup: {
        from: 'teamrequests',
        localField: 'teamId',
        foreignField: '_id',
        as: 'team'
      }
    },
    {
      $unwind: { path: '$team', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        clubName: '$event.clubName',
        studentArray: { $cond: [{ $ifNull: ['$studentId', false] }, ['$studentId'], []] },
        teamCreator: { $cond: [{ $ifNull: ['$team.createdBy', false] }, ['$team.createdBy'], []] },
        teamMembers: { $cond: [{ $ifNull: ['$team.currentMembers', false] }, '$team.currentMembers', []] }
      }
    },
    {
      $project: {
        clubName: 1,
        membersArray: { $setUnion: ['$studentArray', '$teamCreator', '$teamMembers'] }
      }
    },
    { $unwind: { path: '$membersArray', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $toLower: { $trim: { input: '$clubName' } } },
        originalClubName: { $first: '$clubName' },
        uniqueMembers: { $addToSet: '$membersArray' }
      }
    },
    {
      $project: {
        _id: 0,
        club: '$originalClubName',
        members: { $size: '$uniqueMembers' }
      }
    },
    { $sort: { members: -1 } }
  ]);
  
  console.log("CHART DATA AGG:");
  console.log(chartDataAgg);
  
  mongoose.disconnect();
});
