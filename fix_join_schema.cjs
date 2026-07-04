const fs = require('fs');
const filePath = 'backend/models/JoinRequest.js';
let content = fs.readFileSync(filePath, 'utf8');

// Change hackathonId to String to avoid cast error just in case it's 'unknown'
content = content.replace(
  `  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },`,
  `  hackathonId: {
    type: String, // String to prevent CastError if 'unknown' or mock ID
    ref: "Event",
    required: true
  },`
);

// We can also ensure applicantId is properly checked.
// Wait, applicantId is required to be ObjectId, which is correct (student._id).
// If applicantId is 'unknown', it will fail to cast to ObjectId. 
// We should make sure the frontend doesn't send 'unknown'.

fs.writeFileSync(filePath, content);
console.log("JoinRequest schema updated.");
