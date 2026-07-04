const fs = require('fs');
const filePath = 'src/store/hackathonStore.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix sendJoinRequest applicantId
content = content.replace(
  `applicantId: sender?.id ? String(sender.id) : 'unknown',`,
  `applicantId: sender?._id || sender?.id ? String(sender._id || sender.id) : 'unknown',`
);

// We rely on fetchHackathonData() in acceptJoinRequest so we don't need to manually update state,
// but we DO need to ensure addTeamRequest uses _id, which I think I already replaced successfully.
fs.writeFileSync(filePath, content);
console.log("hackathonStore.js sendJoinRequest updated successfully.");
