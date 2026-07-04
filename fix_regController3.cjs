const fs = require('fs');
const filePath = 'backend/controllers/registrationController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Update the population of createdBy in getEventRegistrations
// It currently looks like:
/*
          if (teamReq) {
            // Find team lead
            const teamLead = await Student.findById(teamReq.createdBy).select('name email phone department rollNumber _id');
*/

content = content.replace(
  `            // Find team lead
            const teamLead = await Student.findById(teamReq.createdBy).select('name email phone department rollNumber _id');`,
  `            // Find team lead properly (createdBy is ObjectId now, but just to be safe, extract _id if populated)
            const createdById = teamReq.createdBy?._id || teamReq.createdBy;
            const teamLead = await Student.findById(createdById).select('name email phone department rollNumber _id');`
);

fs.writeFileSync(filePath, content);
console.log("registrationController.js createdBy fix applied.");
