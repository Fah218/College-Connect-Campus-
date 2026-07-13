import mongoose from 'mongoose';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function testTime() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");
  
  console.time("JS Load");
  const allRegistrations = await Registration.find({})
      .select('eventId studentId teamId participationType createdAt')
      .populate('teamId', 'createdBy currentMembers offlineMembers')
      .lean();
  console.timeEnd("JS Load");

  console.time("Agg Load");
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
      { $sort: { members: -1 } },
      { $limit: 10 }
    ]);
  console.timeEnd("Agg Load");
  
  process.exit(0);
}
testTime();
