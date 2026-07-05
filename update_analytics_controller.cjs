const fs = require('fs');

const content = `import Registration from '../models/Registration.js';
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

    const allEvents = await Event.find({}).sort({ createdAt: -1 }).lean();
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

    const registeredTeams = await TeamRequest.countDocuments();

    // 1. Club Management Data (Clubs List)
    const clubHeads = await ClubHead.find({}).lean();
    const clubDataMap = {};
    
    for (const ch of clubHeads) {
      const cName = ch.clubName || 'Unknown Club';
      if (!clubDataMap[cName]) {
        clubDataMap[cName] = {
          id: ch._id,
          name: cName,
          head: ch.name,
          members: 0, // No club membership collection exists, so 0
          events: 0,
          status: 'Active',
          isArchived: ch.isArchived || false
        };
      }
    }

    // Add event counts to clubs
    for (const event of allEvents) {
      const cName = event.club || 'Unknown Club';
      if (!clubDataMap[cName]) {
        clubDataMap[cName] = {
          id: cName, // Mock ID since no ClubHead exists
          name: cName,
          head: 'Pending Assignment',
          members: 0,
          events: 0,
          status: 'Active',
          isArchived: false
        };
      }
      clubDataMap[cName].events += 1;
    }

    const clubs = Object.values(clubDataMap);

    // 2. Chart Data (Most Active Clubs)
    const chartData = clubs.filter(c => c.events > 0).map(c => ({
      name: c.name,
      attendees: c.events // Representing activity by event count since attendees are per event
    }));

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
        description: \`Event creation grew by \${growthRate}% in the last 30 days (\${recentEvents} new events).\`,
        trend: growthRate >= 0 ? 'up' : 'down'
      },
      {
        id: 'engagement',
        type: 'engagement',
        title: 'Platform Engagement',
        description: \`\${recentRegs} new registrations in the last 30 days.\`,
        trend: recentRegs > 0 ? 'up' : 'neutral'
      },
      {
        id: 'pending',
        type: 'warning',
        title: 'Pending Actions',
        description: \`\${pendingEvents.length} events are currently awaiting your approval.\`,
        trend: pendingEvents.length > 5 ? 'down' : 'neutral'
      }
    ];

    // 4. Monthly Trend Data
    const monthlyAgg = await Registration.aggregate([
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

    const myEvents = await Event.find({ clubId }).sort({ createdAt: -1 }).lean();
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

    const registeredTeamsCount = await TeamRequest.countDocuments({ eventId: { $in: eventIds } });

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
        eventHistory: myEvents
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
`;

fs.writeFileSync('backend/controllers/analyticsController.js', content);
console.log('Successfully updated backend/controllers/analyticsController.js');
