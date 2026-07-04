import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import JoinRequest from '../models/JoinRequest.js';
import TeamRequest from '../models/TeamRequest.js';
import Student from '../models/Student.js';
import ClubHead from '../models/ClubHead.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

// @desc    Get student dashboard & profile analytics
// @route   GET /api/analytics/student
// @access  Private (Student only)
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Registered Events (including individual and team where user is a member)
    const registrations = await Registration.find({
      $or: [
        { studentId: userId },
        { 'teamId': { $exists: true } } // We'll filter the team members below since teamId might be an object in legacy but mostly it's a ref. Wait! If teamId is populated, it's better.
      ]
    }).populate('teamId').populate('eventId').lean();

    const studentRegistrations = registrations.filter(reg => {
      if (reg.participationType === 'Individual') return reg.studentId?.toString() === userId.toString();
      if (reg.participationType === 'Team' && reg.teamId) {
        // Check if user is createdBy
        if (reg.teamId.createdBy?.toString() === userId.toString()) return true;
        // Check currentMembers
        const members = reg.teamId.currentMembers || [];
        return members.some(m => m.toString() === userId.toString() || (m._id && m._id.toString() === userId.toString()));
      }
      return false;
    });

    const registeredEventsCount = studentRegistrations.length;

    // 2. Joined Hackathons
    const joinedHackathons = studentRegistrations.filter(reg => reg.eventId?.category === 'Hackathon').length;

    // 3. Team Invitations (Pending join requests where student owns the team)
    // Find all teams created by this user
    const userTeams = await TeamRequest.find({ createdBy: userId }).select('_id').lean();
    const teamIds = userTeams.map(t => t._id);
    const teamInvitations = await JoinRequest.countDocuments({ teamRequestId: { $in: teamIds }, status: 'pending' });

    // 4. Upcoming Events (Approved events, date > today, registered)
    const today = new Date();
    const upcomingEvents = studentRegistrations.filter(reg => {
      return reg.eventId?.status === 'approved' && new Date(reg.eventId.date) > today;
    }).map(reg => reg.eventId);

    // Profile Specific
    const eventsAttended = studentRegistrations.filter(reg => new Date(reg.eventId?.date) <= today).length;
    
    // Clubs Interacted With
    const clubIds = studentRegistrations.map(reg => reg.eventId?.clubId?.toString()).filter(Boolean);
    const distinctClubsCount = new Set(clubIds).size;
    
    // Hackathon Experience: hackathons registered + teams joined/led
    const teamsLed = studentRegistrations.filter(reg => reg.participationType === 'Team' && reg.teamId?.createdBy?.toString() === userId.toString()).length;
    const teamsJoined = studentRegistrations.filter(reg => reg.participationType === 'Team' && reg.teamId?.createdBy?.toString() !== userId.toString()).length;
    const hackathonExperience = joinedHackathons + teamsLed + teamsJoined;

    // Sort event history
    const eventHistory = studentRegistrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        distinctClubsCount,
        hackathonExperience,
        eventHistory
      }
    });
  } catch (error) {
    console.error('Error in getStudentAnalytics:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get club head dashboard & profile analytics
// @route   GET /api/analytics/clubhead
// @access  Private (ClubHead only)
export const getClubHeadAnalytics = async (req, res) => {
  try {
    const clubId = req.user._id;

    const myEvents = await Event.find({ clubId }).sort({ createdAt: -1 }).lean();
    
    const totalEvents = myEvents.length;
    const approved = myEvents.filter(e => e.status === 'approved');
    const pending = myEvents.filter(e => e.status === 'pending');
    const rejected = myEvents.filter(e => e.status === 'rejected');

    const totalAttendees = approved.reduce((sum, e) => sum + (e.totalParticipants || 0), 0);

    // Profile specific
    let topEvent = null;
    let maxRegistrations = 0;
    
    if (myEvents.length > 0) {
      topEvent = myEvents.reduce((prev, current) => (prev.totalParticipants > current.totalParticipants) ? prev : current);
      maxRegistrations = topEvent.totalParticipants || 0;
    }

    res.status(200).json({
      dashboard: {
        totalEvents,
        approved: approved.length,
        pendingApproval: pending.length,
        totalAttendees
      },
      profile: {
        totalEvents,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        topPerformingEvent: topEvent,
        mostRegistrations: maxRegistrations,
        eventHistory: myEvents
      }
    });
  } catch (error) {
    console.error('Error in getClubHeadAnalytics:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get admin dashboard & profile analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    // Basic system counts
    const studentCount = await Student.countDocuments();
    const clubHeadCount = await ClubHead.countDocuments();
    const adminCount = await Admin.countDocuments();
    const totalUsers = studentCount + clubHeadCount + adminCount;

    const allEvents = await Event.find({}).sort({ createdAt: -1 }).lean();
    const totalEvents = allEvents.length;
    
    const approvedEvents = allEvents.filter(e => e.status === 'approved');
    const pendingEvents = allEvents.filter(e => e.status === 'pending');
    const rejectedEvents = allEvents.filter(e => e.status === 'rejected');

    // Registration insights
    const allRegistrations = await Registration.find({}).populate('teamId').lean();
    const totalRegistrations = allRegistrations.length;
    
    let totalParticipants = 0;
    allRegistrations.forEach(reg => {
      if (reg.participationType === 'Individual') {
        totalParticipants += 1;
      } else if (reg.participationType === 'Team') {
        if (reg.teamId) {
          totalParticipants += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0);
        } else if (reg.teamDetails) {
          totalParticipants += (reg.teamDetails.members?.length || 1);
        }
      }
    });

    // Monthly Growth Trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month

    const monthlyAgg = await Registration.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthTrend = monthlyAgg.map(item => ({
      month: monthNames[item._id.month - 1],
      participants: item.count // Approximating participants by registration count for trend
    }));

    // Fill missing months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      if (!growthTrend.find(g => g.month === mName)) {
        growthTrend.unshift({ month: mName, participants: 0 });
      }
    }
    const sortedTrend = growthTrend.slice(-6); // Ensure exactly 6 months

    // Clubs Managed
    const activeClubs = clubHeadCount; // Approximating all created as active for now

    res.status(200).json({
      dashboard: {
        totalEvents,
        approved: approvedEvents.length,
        totalRegistrations,
        totalParticipants
      },
      profile: {
        totalUsers,
        totalEvents,
        totalClubHeads: clubHeadCount,
        approvalInsights: {
          totalRequests: totalEvents,
          approved: approvedEvents.length,
          rejected: rejectedEvents.length,
          pending: pendingEvents.length
        },
        totalStudentParticipation: totalParticipants,
        growthTrend: sortedTrend,
        activitySummary: {
          recentApprovals: approvedEvents.slice(0, 3),
          recentRejections: rejectedEvents.slice(0, 3),
          clubsManaged: activeClubs
        }
      }
    });
  } catch (error) {
    console.error('Error in getAdminAnalytics:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
