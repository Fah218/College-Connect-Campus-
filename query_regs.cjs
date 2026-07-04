const mongoose = require('mongoose');
const Registration = require('./backend/models/Registration.js').default;
const TeamRequest = require('./backend/models/TeamRequest.js').default;

async function check() {
  await mongoose.connect('mongodb+srv://fahadfurquan:U13tQ5GzQIt53Y7H@cluster0.87c4iny.mongodb.net/college-campus?retryWrites=true&w=majority');
  
  const regs = await Registration.find({ participationType: 'Team', teamId: { $exists: true, $ne: null } }).lean();
  console.log("Team Registrations found:", regs.length);
  
  if (regs.length > 0) {
    const eventId = regs[0].eventId;
    console.log("Event ID to query:", eventId);
  }
  process.exit(0);
}
check();
