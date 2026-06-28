const fs = require('fs');
const file = 'src/components/ParticipantsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// Helper to calculate total team size based on type
const targetSizeCalc = `(r.teamId?.currentMembers?.length || 0)`;
const newSizeCalc = `(r.teamDetails ? r.teamDetails.members?.length - 1 : r.teamId?.currentMembers?.length || 0)`;
content = content.replace(targetSizeCalc, newSizeCalc);

// Patch downloadCSV
const targetDownload = `      teamRegs.forEach(reg => {
        const teamName = (reg.teamId?.title || reg.teamId?.name || 'Unknown Team').replace(/,/g, ' ');
        const lead = (reg.teamId?.createdBy?.name || 'N/A').replace(/,/g, ' ');
        const leadEmail = (reg.teamId?.createdBy?.email || 'N/A').replace(/,/g, ' ');
        const members = (reg.teamId?.currentMembers || []).map(m => m.name || m.email).join(' | ').replace(/,/g, ' ');
        const memberEmails = (reg.teamId?.currentMembers || []).map(m => m.email).join(' | ').replace(/,/g, ' ');
        const size = (reg.teamId?.currentMembers ? reg.teamId.currentMembers.length + 1 : 1);
        const date = format(new Date(reg.createdAt), 'MMM dd yyyy');
        csvContent += \`\${teamName},\${lead},\${leadEmail},\${members},\${memberEmails},\${size},\${date}\\n\`;
      });`;

const newDownload = `      teamRegs.forEach(reg => {
        let teamName, lead, leadEmail, members, memberEmails, size;
        if (reg.teamDetails) {
          teamName = (reg.teamDetails.teamName || 'Unknown Team').replace(/,/g, ' ');
          const leaderData = reg.teamDetails.members?.find(m => m.role === 'Leader') || reg.teamDetails.members?.[0];
          const membersData = reg.teamDetails.members?.filter(m => m.role !== 'Leader') || [];
          lead = (leaderData?.name || 'N/A').replace(/,/g, ' ');
          leadEmail = (leaderData?.email || 'N/A').replace(/,/g, ' ');
          members = membersData.map(m => m.name || m.email).join(' | ').replace(/,/g, ' ');
          memberEmails = membersData.map(m => m.email).join(' | ').replace(/,/g, ' ');
          size = reg.teamDetails.members?.length || 1;
        } else {
          teamName = (reg.teamId?.title || reg.teamId?.name || 'Unknown Team').replace(/,/g, ' ');
          lead = (reg.teamId?.createdBy?.name || 'N/A').replace(/,/g, ' ');
          leadEmail = (reg.teamId?.createdBy?.email || 'N/A').replace(/,/g, ' ');
          members = (reg.teamId?.currentMembers || []).map(m => m.name || m.email).join(' | ').replace(/,/g, ' ');
          memberEmails = (reg.teamId?.currentMembers || []).map(m => m.email).join(' | ').replace(/,/g, ' ');
          size = (reg.teamId?.currentMembers ? reg.teamId.currentMembers.length + 1 : 1);
        }
        const date = format(new Date(reg.createdAt), 'MMM dd yyyy');
        csvContent += \`\${teamName},\${lead},\${leadEmail},\${members},\${memberEmails},\${size},\${date}\\n\`;
      });`;

content = content.replace(targetDownload, newDownload);

fs.writeFileSync(file, content);
console.log("Patched top of ParticipantsModal");
