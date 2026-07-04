const fs = require('fs');
const filePath = 'backend/controllers/teamController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace createTeamRequest to accept offlineMembers
content = content.replace(
  `const { hackathonId, createdBy, title, description, rolesNeeded, requiredSkills, preferredExperienceLevel, teamSizeLimit, currentMembers, status } = req.body;`,
  `const { hackathonId, createdBy, title, description, rolesNeeded, requiredSkills, preferredExperienceLevel, teamSizeLimit, currentMembers, offlineMembers, status } = req.body;`
);

content = content.replace(
  `      currentMembers: currentMembers || [],
      status: status || 'open'
    });`,
  `      currentMembers: currentMembers || [],
      offlineMembers: offlineMembers || [],
      status: status || 'open'
    });`
);

fs.writeFileSync(filePath, content);
console.log("teamController.js updated.");
