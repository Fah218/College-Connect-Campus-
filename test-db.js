import mongoose from 'mongoose';
import Registration from './backend/models/Registration.js';
import TeamRequest from './backend/models/TeamRequest.js';

async function test() {
  await mongoose.connect('mongodb://localhost:27017/college-campus');
  const regs = await Registration.find({ participationType: 'Team' }).lean();
  console.log("Team Registrations:", JSON.stringify(regs, null, 2));
  
  if (regs.length > 0) {
    const team = await TeamRequest.findById(regs[0].teamId).lean();
    console.log("Team Request:", JSON.stringify(team, null, 2));
  }
  
  process.exit(0);
}
test();
