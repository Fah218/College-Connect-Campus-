const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
  
  const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
  
  const allEvents = await Event.find({}).lean();
  
  const blobEvents = allEvents.filter(e => 
    (e.bannerImage && e.bannerImage.includes('blob:')) || 
    (e.additionalImages && e.additionalImages.some(img => img.includes('blob:'))) ||
    (e.problemStatementPdf && e.problemStatementPdf.includes('blob:'))
  );
  
  console.log('--- BLOB URL EVENTS ---');
  blobEvents.forEach(e => {
    console.log(`Event ID: ${e._id}, Title: ${e.title}`);
  });
  
  const legacyStrings = ['Tech Club', 'My Club', 'temporary', 'test', 'sample'];
  const legacyEvents = allEvents.filter(e => {
    const jsonStr = JSON.stringify(e).toLowerCase();
    return legacyStrings.some(str => jsonStr.includes(str.toLowerCase()));
  });

  console.log('\n--- LEGACY/TEST EVENTS ---');
  legacyEvents.forEach(e => {
    console.log(`Event ID: ${e._id}, Title: ${e.title}, Club: ${e.club || e.clubName}`);
  });

  process.exit();
}

test();
