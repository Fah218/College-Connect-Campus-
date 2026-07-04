const fs = require('fs');
const filePath = 'backend/controllers/teamController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add offlineMembers to destructuring in updateTeamRequest
content = content.replace(
  `const { title, teamName, description, rolesNeeded, roles, requiredSkills, skills, preferredExperienceLevel, teamSizeLimit, currentMembers } = req.body;`,
  `const { title, teamName, description, rolesNeeded, roles, requiredSkills, skills, preferredExperienceLevel, teamSizeLimit, currentMembers, offlineMembers } = req.body;`
);

// Add saving offlineMembers
content = content.replace(
  `if (currentMembers !== undefined) teamRequest.currentMembers = currentMembers;`,
  `if (currentMembers !== undefined) teamRequest.currentMembers = currentMembers;
    if (offlineMembers !== undefined) teamRequest.offlineMembers = offlineMembers;`
);

fs.writeFileSync(filePath, content);
console.log("updateTeamRequest fixed.");
