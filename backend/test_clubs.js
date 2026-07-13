import mongoose from 'mongoose';
import Registration from './models/Registration.js';
import Event from './models/Event.js';
import TeamRequest from './models/TeamRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function testClubs() {
  await mongoose.connect(MONGO_URI);
  
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
    { $unwind: '$membersArray' },
    {
      $group: {
        _id: { $toLower: { $trim: { input: '$clubName' } } },
        uniqueMembers: { $addToSet: { $toString: '$membersArray' } }
      }
    }
  ]);
  
  console.log(JSON.stringify(studentCountsByClub, null, 2));
  process.exit(0);
}
testClubs();
