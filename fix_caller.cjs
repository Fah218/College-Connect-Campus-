const fs = require('fs');
const filePath = 'src/pages/HackathonTeammateFinder.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `await store.addTeamRequest({ ...data, hackathonId: h.id, createdBy: user._id });`,
  `await store.addTeamRequest({ ...data, hackathonId: h.id, createdBy: user._id, owner: user });`
);

fs.writeFileSync(filePath, content);
console.log("Caller updated.");
