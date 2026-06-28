const fs = require('fs');
const file = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (r.participationType === 'Team' && r.teamId) {
      const isLead = String(r.teamId.createdBy) === String(user?.id || user?._id);
      const isMember = (r.teamId.currentMembers || []).some(m => String(m.id || m._id || m) === String(user?.id || user?._id));
      return isLead || isMember;
    }
    return false;`;

const replacement = `    if (r.participationType === 'Team') {
      if (r.teamId) {
        const isLead = String(r.teamId.createdBy) === String(user?.id || user?._id);
        const isMember = (r.teamId.currentMembers || []).some(m => String(m.id || m._id || m) === String(user?.id || user?._id));
        return isLead || isMember;
      } else if (r.teamDetails) {
        return (r.teamDetails.members || []).some(m => m.email?.toLowerCase() === user?.email?.toLowerCase());
      }
    }
    return false;`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Patched isRegisteredBackend");
