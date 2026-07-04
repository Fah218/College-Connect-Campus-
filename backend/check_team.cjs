const mongoose = require('mongoose');
const TeamRequest = require('./models/TeamRequest.js').default;

async function check() {
  await mongoose.connect('mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
  
  const tr = await TeamRequest.findById('6a4681b5a0761353d0cd1ce6').lean();
  console.log(JSON.stringify(tr, null, 2));
  
  process.exit(0);
}
check();
