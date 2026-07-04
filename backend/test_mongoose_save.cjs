const mongoose = require('mongoose');
const TeamRequest = require('./backend/models/TeamRequest.js').default;

async function test() {
  await mongoose.connect('mongodb://localhost:27017/college-campus');
  console.log("Connected");
  
  try {
    const tr = new TeamRequest({
      hackathonId: 'h1',
      createdBy: new mongoose.Types.ObjectId(), // fake objectid
      title: 'Test Team',
      description: 'Testing',
      rolesNeeded: [{role: 'Dev', count: 1}],
      requiredSkills: ['React']
    });
    await tr.save();
    console.log("Saved TeamRequest:", tr._id);
  } catch (err) {
    console.error("Save failed:", err);
  } finally {
    mongoose.disconnect();
  }
}
test();
