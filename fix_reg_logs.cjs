const fs = require('fs');
const filePath = 'backend/controllers/registrationController.js';
let content = fs.readFileSync(filePath, 'utf8');

// First remove the fallback blocks I just added.
content = content.replace(
  `          } else {
            // Fallback for orphaned registrations where TeamRequest was deleted
            reg.teamId = {
              _id: reg.teamId,
              title: reg.teamDetails?.teamName || reg.teamDetails?.title || "Deleted Team",
              status: 'unknown',
              createdBy: { name: 'Unknown (Deleted)', email: 'N/A' },
              currentMembers: reg.teamDetails?.members || [],
              calculatedTeamSize: 1 + (reg.teamDetails?.members?.length || 0)
            };
          }`,
  `          }`
);

content = content.replace(
  `          // Fallback on error to guarantee structure
          reg.teamId = {
            _id: reg.teamId,
            title: reg.teamDetails?.teamName || reg.teamDetails?.title || "Error Loading Team",
            status: 'unknown',
            createdBy: { name: 'Unknown (Error)', email: 'N/A' },
            currentMembers: reg.teamDetails?.members || [],
            calculatedTeamSize: 1 + (reg.teamDetails?.members?.length || 0)
          };`,
  ``
);

// Now add the requested console logs inside getEventRegistrations
const logCode = `
          console.log("----- REGISTRATION AUDIT -----");
          console.log("registration._id:", reg._id);
          console.log("registration.teamId:", reg.teamId);
          console.log("typeof registration.teamId:", typeof reg.teamId);
          
          const teamReq = await TeamRequest.findById(reg.teamId)
`;

content = content.replace(
  `          const teamReq = await TeamRequest.findById(reg.teamId)`,
  logCode
);

const logCodeAfter = `
          console.log("Result of TeamRequest.findById:", teamReq ? (teamReq._id + " (Found)") : "NULL");
          
          if (teamReq) {
            const allMembers = [...(teamReq.currentMembers || []), ...(teamReq.offlineMembers || [])];

            reg.teamId = {
              _id: teamReq._id,
              title: teamReq.title,
              status: teamReq.status,
              createdBy: teamReq.createdBy,
              currentMembers: allMembers,
              calculatedTeamSize: 1 + allMembers.length
            };
            console.log("Reassigned reg.teamId? YES");
          } else {
            console.log("Reassigned reg.teamId? NO, teamReq is null");
          }
`;

content = content.replace(
  `          if (teamReq) {
            const allMembers = [...(teamReq.currentMembers || []), ...(teamReq.offlineMembers || [])];

            reg.teamId = {
              _id: teamReq._id,
              title: teamReq.title,
              status: teamReq.status,
              createdBy: teamReq.createdBy,
              currentMembers: allMembers,
              calculatedTeamSize: 1 + allMembers.length
            };
          }`,
  logCodeAfter
);

fs.writeFileSync(filePath, content);
console.log("Updated registrationController.js with audit logs.");
