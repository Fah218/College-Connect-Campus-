const fs = require('fs');
const filePath = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `      const payload = {
        hackathonId: event.id || event._id,
        createdBy: user?.id || user?._id,
        title: offlineTeamData.title,
        description: 'Offline Team',
        status: 'closed',
        currentMembers
      }`,
  `      const payload = {
        hackathonId: event.id || event._id,
        createdBy: user?.id || user?._id,
        title: offlineTeamData.title,
        description: 'Offline Team',
        status: 'closed',
        offlineMembers: currentMembers,
        currentMembers: []
      }`
);

fs.writeFileSync(filePath, content);
console.log("EventRegistrationPage.jsx updated.");
