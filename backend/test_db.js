import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TeamRequest from './models/TeamRequest.js';
import JoinRequest from './models/JoinRequest.js';

dotenv.config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const tr = await TeamRequest.find();
  const jr = await JoinRequest.find();
  console.log("Team Requests:", JSON.stringify(tr, null, 2));
  console.log("Join Requests:", JSON.stringify(jr, null, 2));
  process.exit();
}
run();
