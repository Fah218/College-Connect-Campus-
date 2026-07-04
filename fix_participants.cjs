const fs = require('fs');
const filePath = 'src/components/ParticipantsModal.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `teamName = (reg.teamDetails.teamName || 'Unknown Team').replace(/,/g, ' ');`,
  `teamName = (reg.teamDetails.teamName || reg.teamDetails.title || 'Untitled Team').replace(/,/g, ' ');`
);

content = content.replace(
  `teamName = (reg.teamId?.title || reg.teamId?.name || 'Unknown Team').replace(/,/g, ' ');`,
  `teamName = (reg.teamId?.title || reg.teamId?.teamName || 'Untitled Team').replace(/,/g, ' ');`
);

content = content.replace(
  `<td className="px-6 py-4 font-medium text-gray-800">{reg.teamDetails?.teamName || reg.teamId?.title || reg.teamId?.name || 'Unknown Team'}</td>`,
  `<td className="px-6 py-4 font-medium text-gray-800">{reg.teamDetails?.teamName || reg.teamId?.title || reg.teamId?.teamName || 'Untitled Team'}</td>`
);

content = content.replace(
  `<p className="font-semibold text-gray-800">{selectedTeam.teamDetails?.teamName || selectedTeam.teamId?.title || selectedTeam.teamId?.name || 'Unknown Team'}</p>`,
  `<p className="font-semibold text-gray-800">{selectedTeam.teamDetails?.teamName || selectedTeam.teamId?.title || selectedTeam.teamId?.teamName || 'Untitled Team'}</p>`
);

fs.writeFileSync(filePath, content);
console.log("ParticipantsModal.jsx updated.");
