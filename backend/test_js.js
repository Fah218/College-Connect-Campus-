import mongoose from 'mongoose';
import Registration from './models/Registration.js';
import Event from './models/Event.js';
import TeamRequest from './models/TeamRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function testJs() {
  await mongoose.connect(MONGO_URI);
  console.time("Fetch Regs");
  const allRegistrations = await Registration.find({})
      .select('eventId studentId teamId participationType createdAt')
      .populate('teamId', 'createdBy currentMembers offlineMembers')
      .populate('eventId', '_id clubName')
      .lean();
  console.timeEnd("Fetch Regs");
  
  console.log("Len:", allRegistrations.length);
  process.exit(0);
}
testJs();
