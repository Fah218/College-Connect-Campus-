const fs = require('fs');
const filePath = 'backend/models/TeamRequest.js';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('offlineMembers:')) {
  content = content.replace(
    `  currentMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],`,
    `  currentMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],
  offlineMembers: [{
    name: String,
    email: String,
    phone: String,
    joinedVia: String
  }],`
  );
  fs.writeFileSync(filePath, content);
  console.log("TeamRequest.js updated.");
} else {
  console.log("TeamRequest.js already has offlineMembers.");
}
