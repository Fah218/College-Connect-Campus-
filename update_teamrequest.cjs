const fs = require('fs');
const filePath = 'backend/models/TeamRequest.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `  createdBy: {
    type: String, // Using String to prevent CastError with current mock IDs
    ref: "Student",
    required: true
  },`,
  `  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },`
);

content = content.replace(
  `  currentMembers: [{
    type: mongoose.Schema.Types.Mixed
  }],`,
  `  currentMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],`
);

fs.writeFileSync(filePath, content);
console.log("TeamRequest.js updated successfully.");
