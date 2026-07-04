const mongoose = require('mongoose');
const TeamRequest = require('./models/TeamRequest.js').default;

async function migrate() {
  await mongoose.connect('mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
  
  const teams = await TeamRequest.find({}).lean();
  let updatedCount = 0;

  for (const team of teams) {
    let needsUpdate = false;
    const newMembers = [];
    
    if (team.currentMembers && Array.isArray(team.currentMembers)) {
      for (const member of team.currentMembers) {
        if (typeof member === 'object' && member !== null) {
          const idStr = member.id || member._id;
          if (idStr && mongoose.Types.ObjectId.isValid(idStr)) {
            newMembers.push(new mongoose.Types.ObjectId(idStr));
            needsUpdate = true;
          } else {
            console.log(`Team ${team._id} has invalid member ID: ${idStr}`);
            needsUpdate = true; // Still flag for update so the invalid object is removed
          }
        } else if (mongoose.Types.ObjectId.isValid(member)) {
          newMembers.push(new mongoose.Types.ObjectId(member));
        }
      }
    }
    
    if (needsUpdate) {
      console.log(`Updating Team ${team._id} - ${team.title}`);
      await mongoose.connection.collection('teamrequests').updateOne(
        { _id: team._id },
        { $set: { currentMembers: newMembers } }
      );
      updatedCount++;
    }
  }
  
  console.log(`Migration complete. Updated ${updatedCount} teams.`);
  process.exit(0);
}
migrate();
