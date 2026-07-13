import mongoose from 'mongoose';
import Student from './models/Student.js';
import ClubHead from './models/ClubHead.js';
import Admin from './models/Admin.js';

const MONGO_URI = "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function run() {
  await mongoose.connect(MONGO_URI);
  const student = await Student.findOne();
  const clubHead = await ClubHead.findOne();
  const admin = await Admin.findOne();
  
  console.log("Student ID:", student?._id);
  console.log("ClubHead ID:", clubHead?._id);
  console.log("Admin ID:", admin?._id);
  process.exit(0);
}
run();
