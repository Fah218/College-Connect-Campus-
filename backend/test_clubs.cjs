const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
  
  const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
  
  const events = await Event.find({}).lean();
  
  const distinctClubs = [...new Set(events.map(e => e.club || e.clubName || 'Unknown Club'))];
  console.log('Total distinct clubs from events:', distinctClubs.length);
  console.log('Clubs:', distinctClubs);
  
  process.exit();
}

test();
