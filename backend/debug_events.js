import mongoose from 'mongoose';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import TeamRequest from './models/TeamRequest.js'; // Ensure it's imported
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const events = await Event.find().lean();
  
  for (const event of events) {
    const registrations = await Registration.find({ eventId: event._id }).populate('teamId');
    
    let individualCount = 0;
    let teamCount = 0;
    let totalParticipants = 0;

    for (const reg of registrations) {
      if (reg.participationType === 'Individual') {
        individualCount += 1;
        totalParticipants += 1;
      } else if (reg.participationType === 'Team' && reg.teamId) {
        teamCount += 1;
        const teamSize = 1 + (reg.teamId.currentMembers ? reg.teamId.currentMembers.length : 0);
        totalParticipants += teamSize;
      }
    }
    
    console.log(`Event: ${event.title}`);
    console.log(`- eventId: ${event._id}`);
    console.log(`- category: ${event.category}`);
    console.log(`- participationType: ${event.participationType}`);
    console.log(`- registrations found: ${registrations.length}`);
    console.log(`- individualCount: ${individualCount}`);
    console.log(`- teamCount: ${teamCount}`);
    console.log(`- teamParticipants: ${totalParticipants - individualCount}`);
    console.log(`- totalParticipants: ${totalParticipants}`);
    console.log('-------------------------');
  }

  process.exit(0);
}

debug();
