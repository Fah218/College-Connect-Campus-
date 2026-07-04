const mongoose = require('mongoose');
const Registration = require('./models/Registration.js').default;

async function check() {
  await mongoose.connect('mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
  
  const regs = await Registration.find({ participationType: 'Team', teamId: { $exists: true, $ne: null } }).lean();
  console.log("Team Registrations found:", regs.length);
  
  if (regs.length > 0) {
    for (const r of regs) {
      console.log(`Event ID: ${r.eventId}, Reg ID: ${r._id}, Team ID: ${r.teamId}`);
    }
  }
  process.exit(0);
}
check();
