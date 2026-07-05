const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect('mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
  
  const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
  const TeamRequest = mongoose.model('TeamRequest', new mongoose.Schema({}, { strict: false }));
  
  // 1. Remove blob URLs
  console.log('Sanitizing blob: URLs...');
  const allEvents = await Event.find({}).lean();
  let updatedCount = 0;
  for (const e of allEvents) {
    let changed = false;
    let updates = {};
    if (e.problemStatementPdf && e.problemStatementPdf.startsWith('blob:')) {
      updates.problemStatementPdf = '';
      changed = true;
    }
    if (e.bannerImage && e.bannerImage.startsWith('blob:')) {
      updates.bannerImage = '';
      changed = true;
    }
    if (changed) {
      await Event.updateOne({ _id: e._id }, { $set: updates });
      updatedCount++;
    }
  }
  console.log(`Sanitized ${updatedCount} events with blob URLs.`);

  // 2. Remove Legacy Events
  const legacyStrings = ['Tech Club', 'My Club', 'temporary', 'test', 'sample'];
  const eventsToDelete = allEvents.filter(e => {
    const jsonStr = JSON.stringify(e).toLowerCase();
    return legacyStrings.some(str => jsonStr.includes(str.toLowerCase()));
  });
  
  console.log(`Found ${eventsToDelete.length} legacy events to delete.`);
  
  const eventIdsToDelete = eventsToDelete.map(e => e._id);
  if (eventIdsToDelete.length > 0) {
    const deletedEvents = await Event.deleteMany({ _id: { $in: eventIdsToDelete } });
    console.log(`Deleted ${deletedEvents.deletedCount} legacy events.`);
    
    const deletedRegs = await Registration.deleteMany({ eventId: { $in: eventIdsToDelete } });
    console.log(`Deleted ${deletedRegs.deletedCount} legacy registrations.`);
    
    // TeamRequest uses string eventId sometimes, sometimes ObjectId. We'll handle both if necessary,
    // but the schema says eventId: { type: String, ref: 'Event' }
    const stringIds = eventIdsToDelete.map(id => String(id));
    const deletedTeams = await TeamRequest.deleteMany({ eventId: { $in: stringIds } });
    console.log(`Deleted ${deletedTeams.deletedCount} legacy team requests.`);
  }

  process.exit();
}

migrate();
