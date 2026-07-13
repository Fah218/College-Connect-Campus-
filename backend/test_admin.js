import mongoose from 'mongoose';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import ClubHead from './models/ClubHead.js';
import Student from './models/Student.js';
import Admin from './models/Admin.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  try {
    const studentCount = await Student.countDocuments();
    const clubHeadCount = await ClubHead.countDocuments();
    const adminCount = await Admin.countDocuments();
    const totalUsers = studentCount + clubHeadCount + adminCount;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalEvents,
      approvedEventsCount,
      pendingEventsCount,
      rejectedEventsCount,
      recentEvents,
      recentApprovals,
      recentRejections,
      totalRegistrations,
      recentRegs,
      regStats
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'rejected' }),
      Event.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Event.find({ status: 'approved' }).select('-__v').sort({ createdAt: -1 }).limit(3).lean(),
      Event.find({ status: 'rejected' }).select('-__v').sort({ createdAt: -1 }).limit(3).lean(),
      Registration.countDocuments(),
      Registration.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Registration.aggregate([
        {
          $lookup: {
            from: 'teamrequests',
            localField: 'teamId',
            foreignField: '_id',
            as: 'team'
          }
        },
        { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalParticipants: {
              $sum: {
                $cond: [
                  { $eq: ['$participationType', 'Individual'] },
                  1,
                  {
                    $cond: [
                      { $eq: ['$participationType', 'Team'] },
                      {
                        $add: [
                          1, // creator
                          { $size: { $ifNull: ['$team.currentMembers', []] } },
                          { $size: { $ifNull: ['$team.offlineMembers', []] } }
                        ]
                      },
                      0
                    ]
                  }
                ]
              }
            },
            registeredTeams: {
              $sum: { $cond: [{ $eq: ['$participationType', 'Team'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const totalParticipants = regStats.length > 0 ? regStats[0].totalParticipants : 0;
    const registeredTeams = regStats.length > 0 ? regStats[0].registeredTeams : 0;

    // 1. Club Management Data (Clubs List)
    const clubHeads = await ClubHead.find({}).lean();
    
    const eventCountsByClub = await Event.aggregate([
      { $group: { _id: { $toLower: { $trim: { input: "$clubName" } } }, count: { $sum: 1 } } }
    ]);
    const eventCountMap = {};
    eventCountsByClub.forEach(e => {
      if (e._id) eventCountMap[e._id] = e.count;
    });

    const studentCountsByClub = await Registration.aggregate([
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
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
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
          uniqueMembers: { $addToSet: '$membersArray' },
          originalClubName: { $first: '$clubName' }
        }
      }
    ]);
    const studentCountMap = {};
    const chartDataAgg = [];
    studentCountsByClub.forEach(c => {
      if (c._id) {
         studentCountMap[c._id] = c.uniqueMembers.length;
         if (c.uniqueMembers.length > 0 && c.originalClubName) {
           chartDataAgg.push({ club: c.originalClubName, members: c.uniqueMembers.length });
         }
      }
    });

    const clubs = clubHeads.map(ch => {
      const cName = (ch.clubName || '').trim().toLowerCase();
      return {
        id: ch._id,
        name: ch.clubName,
        head: ch.name,
        members: studentCountMap[cName] || 0,
        events: eventCountMap[cName] || 0,
        status: ch.status || 'Active',
        isArchived: ch.isArchived || false
      };
    });

    const chartData = chartDataAgg.sort((a,b) => b.members - a.members);

    // 3. Platform Insights (Dynamic)
    const oldEvents = totalEvents - recentEvents;
    const growthRate = oldEvents === 0 ? (recentEvents * 100) : Math.round((recentEvents / oldEvents) * 100);

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
        description: `${pendingEventsCount} events are currently awaiting your approval.`,
        trend: pendingEventsCount > 5 ? 'down' : 'neutral'
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

    const payload = {
      dashboard: {
        totalEvents,
        approved: approvedEventsCount,
        totalRegistrations,
        totalParticipants,
        registeredTeams,
        clubs,
        insights,
        chartData,
        monthlyData,
        pending: pendingEventsCount,
        rejected: rejectedEventsCount
      },
      profile: {
        totalUsers,
        totalEvents,
        totalStudents: studentCount,
        totalClubHeads: clubHeadCount,
        approvalInsights: {
          totalRequests: totalEvents,
          approved: approvedEventsCount,
          rejected: rejectedEventsCount,
          pending: pendingEventsCount
        },
        totalStudentParticipation: totalParticipants,
        growthTrend: monthlyData,
        activitySummary: {
          recentApprovals,
          recentRejections,
          clubsManaged: clubHeadCount
        }
      }
    };

    fs.writeFileSync('admin_api_new.json', JSON.stringify(payload, null, 2));
    console.log("Written to admin_api_new.json");

  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
run();
