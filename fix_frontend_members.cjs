const fs = require('fs');

const file = 'src/components/ParticipantsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update downloadCSV for team members
content = content.replace(
  /members = \(reg\.teamId\?\.currentMembers \|\| \[\]\)\.map/g,
  `members = [...(reg.teamId?.currentMembers || []), ...(reg.teamId?.offlineMembers || [])].map`
);

content = content.replace(
  /memberEmails = \(reg\.teamId\?\.currentMembers \|\| \[\]\)\.map/g,
  `memberEmails = [...(reg.teamId?.currentMembers || []), ...(reg.teamId?.offlineMembers || [])].map`
);

// Update Team Members in Modal
content = content.replace(
  /\{\(selectedTeam\.teamId\?\.currentMembers \|\| \[\]\)\.length > 0 \? \(/g,
  `{[...(selectedTeam.teamId?.currentMembers || []), ...(selectedTeam.teamId?.offlineMembers || [])].length > 0 ? (`
);

content = content.replace(
  /\{\(selectedTeam\.teamId\?\.currentMembers \|\| \[\]\)\.map\(\(m, idx\) => \(/g,
  `{[...(selectedTeam.teamId?.currentMembers || []), ...(selectedTeam.teamId?.offlineMembers || [])].map((m, idx) => (`
);

fs.writeFileSync(file, content);
console.log('Fixed ParticipantsModal.jsx members array.');
