const fs = require('fs');

const file = 'src/components/ParticipantsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the teamDetails checks from downloadCSV
content = content.replace(
  /if \(reg\.teamDetails\) \{[\s\S]*?\} else \{([\s\S]*?)\}/,
  `$1`
);

// 2. Fix the Total Participants count in header
content = content.replace(
  /teamRegs\.reduce\(\(acc, r\) => acc \+ 1 \+ \(r\.teamDetails \? r\.teamDetails\.members\?\.length - 1 : r\.teamId\?\.currentMembers\?\.length \|\| 0\), 0\)/,
  `teamRegs.reduce((acc, r) => acc + (r.teamId?.calculatedTeamSize || 1), 0)`
);

// 3. Fix the table rows
content = content.replace(
  /\{reg\.teamDetails\?\.title \|\| reg\.teamId\?\.title\}/g,
  `{reg.teamId?.title}`
);
content = content.replace(
  /\{reg\.teamDetails \? \(reg\.teamDetails\.members\?\.find\(m => m\.role === 'Leader'\)\?\.name \|\| 'N\/A'\) : \(reg\.teamId\?\.createdBy\?\.name \|\| 'N\/A'\)\}/g,
  `{reg.teamId?.createdBy?.name}`
);
content = content.replace(
  /\{reg\.teamDetails \? \(reg\.teamDetails\.members\?\.find\(m => m\.role === 'Leader'\)\?\.email \|\| 'N\/A'\) : \(reg\.teamId\?\.createdBy\?\.email \|\| 'N\/A'\)\}/g,
  `{reg.teamId?.createdBy?.email}`
);
content = content.replace(
  /\{reg\.teamDetails \? \(reg\.teamDetails\.members\?\.length \|\| 1\) : \(reg\.teamId\?\.currentMembers \? reg\.teamId\.currentMembers\.length \+ 1 : 1\)\}/g,
  `{reg.teamId?.calculatedTeamSize}`
);

// 4. Fix the Modal
content = content.replace(
  /\{selectedTeam\.teamDetails\?\.title \|\| selectedTeam\.teamId\?\.title\}/g,
  `{selectedTeam.teamId?.title}`
);
content = content.replace(
  /\{selectedTeam\.teamDetails \? selectedTeam\.teamDetails\.members\?\.length \|\| 1 : selectedTeam\.teamId\?\.currentMembers \? selectedTeam\.teamId\.currentMembers\.length \+ 1 : 1\} Members/,
  `{selectedTeam.teamId?.calculatedTeamSize} Members`
);
content = content.replace(
  /\{selectedTeam\.teamDetails \? \(selectedTeam\.teamDetails\.members\?\.find\(m => m\.role === 'Leader'\)\?\.name \|\| 'N\/A'\) : \(selectedTeam\.teamId\?\.createdBy\?\.name \|\| 'N\/A'\)\}/g,
  `{selectedTeam.teamId?.createdBy?.name}`
);
content = content.replace(
  /\{selectedTeam\.teamDetails \? \(selectedTeam\.teamDetails\.members\?\.find\(m => m\.role === 'Leader'\)\?\.email \|\| 'N\/A'\) : \(selectedTeam\.teamId\?\.createdBy\?\.email \|\| 'N\/A'\)\}/g,
  `{selectedTeam.teamId?.createdBy?.email}`
);
content = content.replace(
  /\{selectedTeam\.teamDetails \? \(selectedTeam\.teamDetails\.members\?\.find\(m => m\.role === 'Leader'\)\?\.phone \|\| 'Phone: —'\) : \(selectedTeam\.teamId\?\.createdBy\?\.phone \? selectedTeam\.teamId\.createdBy\.phone : 'Phone: —'\)\}/g,
  `{selectedTeam.teamId?.createdBy?.phone || 'Phone: —'}`
);

// 5. Fix Team Members rendering in Modal
content = content.replace(
  /\{\(selectedTeam\.teamDetails \? \(selectedTeam\.teamDetails\.members\?\.filter\(m => m\.role !== 'Leader'\) \|\| \[\]\) : \(selectedTeam\.teamId\?\.currentMembers \|\| \[\]\)\)\.length > 0 \? \(/g,
  `{(selectedTeam.teamId?.currentMembers || []).length > 0 ? (`
);

content = content.replace(
  /\{\(selectedTeam\.teamDetails \? \(selectedTeam\.teamDetails\.members\?\.filter\(m => m\.role !== 'Leader'\) \|\| \[\]\) : \(selectedTeam\.teamId\?\.currentMembers \|\| \[\]\)\)\.map\(\(m, idx\) => \(/g,
  `{(selectedTeam.teamId?.currentMembers || []).map((m, idx) => (`
);

fs.writeFileSync(file, content);
console.log('Fixed ParticipantsModal.jsx');
