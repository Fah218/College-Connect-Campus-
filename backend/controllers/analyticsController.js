import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import JoinRequest from '../models/JoinRequest.js';
import TeamRequest from '../models/TeamRequest.js';
import Student from '../models/Student.js';
import ClubHead from '../models/ClubHead.js';
import Admin from '../models/Admin.js';

// Helper to determine participation count for an event
const getEventParticipantsCount = async (eventId) => {
  const registrations = await Registration.find({ eventId }).populate('teamId');
  let count = 0;
  registrations.forEach(reg => {
    if (reg.participationType === 'Individual') {
      count += 1;
    } else if (reg.participationType === 'Team' && reg.teamId) {
      count += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0);
    }
  });
  return count;
};

// @desc    Get admin dashboard & profile analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const clubHeadCount = await ClubHead.countDocuments();
    const adminCount = await Admin.countDocuments();
    const totalUsers = studentCount + clubHeadCount + adminCount;

    let allEvents = await Event.find({}).sort({ createdAt: -1 }).lean();
    const totalEvents = allEvents.length;
    const approvedEvents = allEvents.filter(e => e.status === 'approved');
    const pendingEvents = allEvents.filter(e => e.status === 'pending');
    const rejectedEvents = allEvents.filter(e => e.status === 'rejected');

    const allRegistrations = await Registration.find({}).populate('teamId').lean();
    const totalRegistrations = allRegistrations.length;

    let totalParticipants = 0;
    allRegistrations.forEach(reg => {
      if (reg.participationType === 'Individual') totalParticipants += 1;
      else if (reg.participationType === 'Team' && reg.teamId) {
        totalParticipants += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0);
      }
    });

    const registeredTeams = allRegistrations.filter(r => r.participationType === 'Team').length;

    // 1. Club Management Data (Clubs List)
    const clubHeads = await ClubHead.find({}).lean();
    const clubDataMap = {};
    
    for (const ch of clubHeads) {
      if (!ch.clubName) continue;
      const cName = ch.clubName.trim().toLowerCase();
      
      const clubEvents = allEvents.filter(e => (e.clubName || '').trim().toLowerCase() === cName).map(e => String(e._id));
      const uniqueStudents = new Set();
      const clubRegs = allRegistrations.filter(r => clubEvents.includes(String(r.eventId._id || r.eventId)));
      
      for (const reg of clubRegs) {
        if (reg.studentId) uniqueStudents.add(String(reg.studentId._id || reg.studentId));
        if (reg.teamId) {
           if (reg.teamId.createdBy) uniqueStudents.add(String(reg.teamId.createdBy._id || reg.teamId.createdBy));
           if (reg.teamId.currentMembers) {
              reg.teamId.currentMembers.forEach(mId => uniqueStudents.add(String(mId._id || mId)));
           }
        }
      }

      if (!clubDataMap[cName]) {
        clubDataMap[cName] = {
          id: ch._id,
          name: ch.clubName,
          head: ch.name,
          members: uniqueStudents.size, // Calculated actual unique members
          events: 0,
          status: ch.status || 'Active',
          isArchived: ch.isArchived || false
        };
      }
    }

    // Add event counts to clubs ONLY if they exist in DB
    for (const event of allEvents) {
      const cName = (event.clubName || '').trim().toLowerCase();
      if (cName && clubDataMap[cName]) {
        clubDataMap[cName].events += 1;
      }
    }

    const clubs = Object.values(clubDataMap);

    // 2. Chart Data (Most Active Clubs) - Pure MongoDB Aggregation
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
    
    const chartData = chartDataAgg.filter(c => c.members > 0 && c.club);

    // 3. Platform Insights (Dynamic)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEvents = allEvents.filter(e => new Date(e.createdAt) >= thirtyDaysAgo).length;
    const oldEvents = allEvents.length - recentEvents;
    const growthRate = oldEvents === 0 ? (recentEvents * 100) : Math.round((recentEvents / oldEvents) * 100);

    const recentRegs = allRegistrations.filter(r => new Date(r.createdAt) >= thirtyDaysAgo).length;
    
    const insights = [
      {
        id: 'growth',
        type: 'growth',
        title: 'Event Growth',
        description: `Event creation grew by ${growthRate}% in the last 30 days (${recentEvents} new events).`,
        trend: growthRate >= 0 ? 'up' : 'down'
      },
      {
        id: 'engagement',
        type: 'engagement',
        title: 'Platform Engagement',
        description: `${recentRegs} new registrations in the last 30 days.`,
        trend: recentRegs > 0 ? 'up' : 'neutral'
      },
      {
        id: 'pending',
        type: 'warning',
        title: 'Pending Actions',
        description: `${pendingEvents.length} events are currently awaiting your approval.`,
        trend: pendingEvents.length > 5 ? 'down' : 'neutral'
      }
    ];

    // 4. Monthly Trend Data
    const monthlyAgg = await Event.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyData = monthlyAgg.map(item => ({
      month: monthNames[item._id.month - 1],
      events: item.count 
    }));
    if(monthlyData.length === 0) {
       monthlyData = monthNames.slice(0, 6).map(m => ({ month: m, events: 0 }));
    }

    res.status(200).json({
      dashboard: {
        totalEvents,
        approved: approvedEvents.length,
        totalRegistrations,
        totalParticipants,
        registeredTeams,
        clubs,
        insights,
        chartData,
        monthlyData,
        pending: pendingEvents.length,
        rejected: rejectedEvents.length
      },
      profile: {
        totalUsers,
        totalEvents,
        totalStudents: studentCount,
        totalClubHeads: clubHeadCount,
        approvalInsights: {
          totalRequests: totalEvents,
          approved: approvedEvents.length,
          rejected: rejectedEvents.length,
          pending: pendingEvents.length
        },
        totalStudentParticipation: totalParticipants,
        growthTrend: monthlyData,
        activitySummary: {
          recentApprovals: approvedEvents.slice(0, 3),
          recentRejections: rejectedEvents.slice(0, 3),
          clubsManaged: clubHeadCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get club head dashboard & profile analytics
export const getClubHeadAnalytics = async (req, res) => {
  try {
    const clubId = req.query.clubId;
    if (!clubId) return res.status(400).json({ message: 'Club ID is required' });

    // 1. Authenticated Club Head is loaded from MongoDB
    const clubHead = await ClubHead.findById(clubId).lean();
    if (!clubHead) return res.status(404).json({ message: 'Club Head not found' });
    
    // 2. Club name extracted
    const cName = (clubHead.clubName || '').trim().toLowerCase();
    
    console.log(`[AUDIT] Authenticated User: _id=${clubHead._id}, name=${clubHead.name}, clubName=${clubHead.clubName}`);

    // 3. Fetch events and 4 & 5. Filter by normalized string comparison
    const allEvents = await Event.find({}).sort({ createdAt: -1 }).lean();
    let myEvents = allEvents.filter(e => {
       const eventClubName = (e.clubName || '').trim().toLowerCase();
       const isMatch = eventClubName === cName;
       
       // 6. Log every comparison
       if (eventClubName) {
         console.log(`[AUDIT] Auth Club: "${cName}" | Event Club: "${eventClubName}" | Match: ${isMatch}`);
       }
       return isMatch;
    });
    
    // 7. Verify length
    console.log(`[AUDIT] Total events found for this club: ${myEvents.length}`);

    const eventIds = myEvents.map(e => e._id);
    
    const approved = myEvents.filter(e => e.status === 'approved');
    const pending = myEvents.filter(e => e.status === 'pending');
    const rejected = myEvents.filter(e => e.status === 'rejected');

    const today = new Date();
    const upcomingEvents = approved.filter(e => new Date(e.date || e.startDate) >= today);
    const pastEvents = approved.filter(e => new Date(e.date || e.startDate) < today);

    const myRegistrations = await Registration.find({ eventId: { $in: eventIds } }).populate('teamId').lean();
    let totalParticipants = 0;
    myRegistrations.forEach(reg => {
      if (reg.participationType === 'Individual') totalParticipants += 1;
      else if (reg.participationType === 'Team' && reg.teamId) {
        totalParticipants += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0);
      }
    });

    const registeredTeamsCount = myRegistrations.filter(r => r.participationType === 'Team').length;

    let topEvent = null;
    let maxRegs = 0;
    for (const e of approved) {
       const cnt = await getEventParticipantsCount(e._id);
       if(cnt >= maxRegs) {
          maxRegs = cnt;
          topEvent = e;
       }
    }

    res.status(200).json({
      dashboard: {
        totalEvents: myEvents.length,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        totalRegistrations: myRegistrations.length,
        totalParticipants,
        registeredTeams: registeredTeamsCount,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length
      },
      profile: {
        totalEventsCreated: myEvents.length,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        topPerformingEvent: topEvent,
        mostRegistrations: maxRegs,
        eventHistory: myEvents,
        participationData: myEvents.slice(0, 5).map(e => ({
          event: e.title.substring(0, 15) + (e.title.length > 15 ? '...' : ''),
          participants: e.totalParticipants || 0
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get student dashboard & profile analytics
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const student = await Student.findById(userId).lean();

    const registrations = await Registration.find({
      $or: [
        { studentId: userId },
        { 'teamId': { $exists: true } }
      ]
    }).populate('teamId').populate('eventId').lean();

    const studentRegistrations = registrations.filter(reg => {
      if (reg.participationType === 'Individual') return reg.studentId?.toString() === userId.toString();
      if (reg.participationType === 'Team' && reg.teamId) {
        if (reg.teamId.createdBy?.toString() === userId.toString()) return true;
        const members = reg.teamId.currentMembers || [];
        return members.some(m => m.toString() === userId.toString() || (m._id && m._id.toString() === userId.toString()));
      }
      return false;
    });

    const registeredEventsCount = studentRegistrations.length;
    const joinedHackathons = studentRegistrations.filter(reg => reg.eventId?.category === 'Hackathon').length;

    const userTeams = await TeamRequest.find({ createdBy: userId }).select('_id').lean();
    const teamIds = userTeams.map(t => t._id);
    const teamInvitations = await JoinRequest.countDocuments({ teamRequestId: { $in: teamIds }, status: 'pending' });

    const today = new Date();
    const upcomingEvents = studentRegistrations.filter(reg => {
      return reg.eventId?.status === 'approved' && new Date(reg.eventId.date || reg.eventId.startDate) >= today;
    }).map(reg => reg.eventId);

    const eventsAttended = studentRegistrations.filter(reg => new Date(reg.eventId?.date || reg.eventId.startDate) < today).length;
    
    const clubIds = studentRegistrations.map(reg => reg.eventId?.club || reg.eventId?.clubName).filter(Boolean);
    const uniqueClubs = [...new Set(clubIds)];
    
    const teamsLed = studentRegistrations.filter(reg => reg.participationType === 'Team' && reg.teamId?.createdBy?.toString() === userId.toString()).length;
    const teamsJoined = studentRegistrations.filter(reg => reg.participationType === 'Team' && reg.teamId?.createdBy?.toString() !== userId.toString()).length;
    const hackathonExperienceCount = joinedHackathons + teamsLed + teamsJoined;

    const eventHistory = studentRegistrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Participation Chart (Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const participationCounts = {};
    studentRegistrations.forEach(reg => {
       const d = new Date(reg.createdAt);
       const m = monthNames[d.getMonth()];
       participationCounts[m] = (participationCounts[m] || 0) + 1;
    });
    const participationData = Object.keys(participationCounts).map(month => ({ month, events: participationCounts[month] }));

    res.status(200).json({
      dashboard: {
        registeredEvents: registeredEventsCount,
        joinedHackathons,
        teamInvitations,
        upcomingEventsCount: upcomingEvents.length
      },
      profile: {
        eventsRegistered: registeredEventsCount,
        eventsAttended,
        upcomingEventsCount: upcomingEvents.length,
        distinctClubsCount: uniqueClubs.length,
        uniqueClubs,
        hackathonExperienceCount,
        eventHistory,
        participationData,
        skills: student?.skills || [],
        interests: student?.interests || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get complete analytical dashboard data for a single club (Admin View)
export const getAdminClubAnalytics = async (req, res) => {
  try {
    const clubId = req.params.id;
    if (!clubId) return res.status(400).json({ message: 'Club ID is required' });

    const clubHead = await ClubHead.findById(clubId).lean();
    if (!clubHead) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const cName = (clubHead.clubName || '').trim().toLowerCase();
    
    // Fetch events
    const allEvents = await Event.find({}).lean();
    const myEvents = allEvents.filter(e => (e.clubName || '').trim().toLowerCase() === cName);
    const myEventIds = myEvents.map(e => String(e._id));

    const approved = myEvents.filter(e => e.status === 'approved');
    const pending = myEvents.filter(e => e.status === 'pending');
    const rejected = myEvents.filter(e => e.status === 'rejected');

    // Fetch Registrations
    const allRegistrations = await Registration.find({}).populate('teamId').lean();
    const clubRegs = allRegistrations.filter(r => myEventIds.includes(String(r.eventId._id || r.eventId)));

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
    const avgParticipants = myEvents.length > 0 ? (totalParticipants / myEvents.length).toFixed(1) : 0;

    // Recent Events Table Data
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

    // Chart Data (Monthly Creation)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const creationCounts = {};
    myEvents.forEach(e => {
       const d = new Date(e.createdAt);
       const m = monthNames[d.getMonth()];
       creationCounts[m] = (creationCounts[m] || 0) + 1;
    });
    const monthlyCreation = Object.keys(creationCounts).map(month => ({ month, events: creationCounts[month] }));

    // Chart Data (Participants per Event)
    const eventParticipationChart = recentEvents.slice(0, 10).map(e => ({
      name: e.title.substring(0, 15) + (e.title.length > 15 ? '...' : ''),
      registrations: e.totalRegistrations,
      participants: e.totalParticipants
    }));

    // Timeline
    const timeline = [];
    myEvents.forEach(e => {
       timeline.push({ id: `ec-${e._id}`, type: 'event_created', title: `Event Created: ${e.title}`, date: e.createdAt, eventId: e._id });
       if(e.status === 'approved') timeline.push({ id: `ea-${e._id}`, type: 'event_approved', title: `Event Approved: ${e.title}`, date: e.updatedAt || e.createdAt, eventId: e._id });
       if(e.status === 'rejected') timeline.push({ id: `er-${e._id}`, type: 'event_rejected', title: `Event Rejected: ${e.title}`, date: e.updatedAt || e.createdAt, eventId: e._id });
    });
    clubRegs.forEach(r => {
       const e = myEvents.find(ev => String(ev._id) === String(r.eventId._id || r.eventId));
       const eTitle = e ? e.title : 'Unknown Event';
       if(r.participationType === 'Team') timeline.push({ id: `rt-${r._id}`, type: 'team_registration', title: `Team Registration for ${eTitle}`, date: r.createdAt, eventId: e ? e._id : null });
       else timeline.push({ id: `ri-${r._id}`, type: 'individual_registration', title: `Individual Registration for ${eTitle}`, date: r.createdAt, eventId: e ? e._id : null });
    });
    
    timeline.sort((a,b) => new Date(b.date) - new Date(a.date));
    const recentActivity = timeline.slice(0, 15);

    res.status(200).json({
      club: {
        id: clubHead._id,
        name: clubHead.clubName,
        head: clubHead.name,
        email: clubHead.email,
        phone: clubHead.phone || clubHead.contactNumber || null,
        department: clubHead.department || null,
        designation: clubHead.designation || null,
        profileImage: clubHead.profileImage || null,
        isArchived: clubHead.isArchived,
        createdAt: clubHead.createdAt
      },
      statistics: {
        totalEvents: myEvents.length,
        approvedEvents: approved.length,
        pendingEvents: pending.length,
        rejectedEvents: rejected.length,
        totalRegistrations: clubRegs.length,
        totalParticipants,
        uniqueStudents: uniqueStudents.size,
        registeredTeams: registeredTeamsCount,
        avgParticipants
      },
      charts: {
        monthlyCreation,
        eventParticipationChart,
        approvalRate: [
          { name: 'Approved', value: approved.length },
          { name: 'Pending', value: pending.length },
          { name: 'Rejected', value: rejected.length }
        ]
      },
      recentEvents,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
