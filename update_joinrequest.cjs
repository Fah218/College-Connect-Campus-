const fs = require('fs');
const filePath = 'backend/models/JoinRequest.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `  teamRequestId: {
    type: String, // String to prevent CastError with current mock IDs
    ref: "TeamRequest",
    required: true
  },`,
  `  teamRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamRequest",
    required: true
  },`
);

content = content.replace(
  `  hackathonId: {
    type: String, // String to prevent CastError
    ref: "Hackathon",
    required: true
  },`,
  `  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },`
);

content = content.replace(
  `  applicantId: {
    type: String, // using String to avoid cast errors with mock data
    ref: "Student",
    required: true
  },`,
  `  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },`
);

fs.writeFileSync(filePath, content);
console.log("JoinRequest.js updated successfully.");
