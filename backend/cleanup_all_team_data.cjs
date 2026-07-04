const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/college-campus');
  console.log("Connected to MongoDB.");
  
  const db = mongoose.connection.db;
  
  try {
    const trCount = await db.collection('teamrequests').countDocuments();
    const jrCount = await db.collection('joinrequests').countDocuments();
    const regCount = await db.collection('registrations').countDocuments();
    
    await db.collection('teamrequests').deleteMany({});
    await db.collection('joinrequests').deleteMany({});
    await db.collection('registrations').deleteMany({});
    
    console.log(`Deleted ${trCount} teamrequests, ${jrCount} joinrequests, and ${regCount} registrations.`);
    console.log("Corrupted data wiped. Clean slate for testing established.");
  } catch (err) {
    console.error("Error cleaning up:", err);
  } finally {
    mongoose.disconnect();
  }
}

run();
