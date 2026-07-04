const fs = require('fs');
const filePath = 'backend/controllers/registrationController.js';
let content = fs.readFileSync(filePath, 'utf8');

// The logic inside getEventRegistrations resolves currentMembers:
/*
            const resolvedMembers = (await Promise.all(memberPromises)).filter(Boolean);

            reg.teamId = {
              _id: teamReq._id,
              teamName: teamReq.teamName || teamReq.name,
              title: teamReq.title || teamReq.teamName,
              status: teamReq.status,
              createdBy: teamLead || { _id: teamReq.createdBy, name: 'Unknown', email: 'N/A' },
              currentMembers: resolvedMembers,
              calculatedTeamSize: 1 + resolvedMembers.length
            };
*/
// Let's add offlineMembers to currentMembers array before resolving it
content = content.replace(
  `            const resolvedMembers = (await Promise.all(memberPromises)).filter(Boolean);`,
  `            const resolvedMembers = (await Promise.all(memberPromises)).filter(Boolean);
            const allMembers = [...resolvedMembers, ...(teamReq.offlineMembers || [])];`
);

content = content.replace(
  `              currentMembers: resolvedMembers,
              calculatedTeamSize: 1 + resolvedMembers.length`,
  `              currentMembers: allMembers,
              calculatedTeamSize: 1 + allMembers.length`
);

fs.writeFileSync(filePath, content);
console.log("registrationController.js updated.");
