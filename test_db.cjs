const mongoose = require('mongoose');
const TeamRequest = require('./backend/models/TeamRequest.js').default;
const Registration = require('./backend/models/Registration.js').default;

async function check() {
  await mongoose.connect('mongodb+srv://fahadfurquan:U13tQ5GzQIt53Y7H@cluster0.87c4iny.mongodb.net/college-campus?retryWrites=true&w=majority');
  
  const regs = await Registration.find({ participationType: 'Team', teamId: { $exists: true, $ne: null } }).lean();
  console.log("Team Registrations count:", regs.length);
  
  for (const r of regs) {
    const tr = await TeamRequest.findById(r.teamId).lean();
    console.log(`Registration ID: ${r._id}`);
    console.log(`  Team ID: ${r.teamId}`);
    if (tr) {
      console.log(`  TeamRequest Exists: YES (title: ${tr.title})`);
    } else {
      console.log(`  TeamRequest Exists: NO`);
    }
  }
  process.exit(0);
}
check();
