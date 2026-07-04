const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/college-campus');
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;

  try {
    const teamRequestsCount = await db.collection('teamrequests').countDocuments();
    const joinRequestsCount = await db.collection('joinrequests').countDocuments();

    await db.collection('teamrequests').deleteMany({});
    await db.collection('joinrequests').deleteMany({});

    console.log(`Deleted ${teamRequestsCount} teamrequests and ${joinRequestsCount} joinrequests to normalize ObjectIds.`);
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    mongoose.disconnect();
  }
}

run();
