import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JoinRequest from './models/JoinRequest.js';
import Student from './models/Student.js';

dotenv.config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const jr = await JoinRequest.find().populate('applicantId', 'name email department phone');
  console.log("Populated Join Requests:", JSON.stringify(jr, null, 2));
  process.exit();
}
run();
