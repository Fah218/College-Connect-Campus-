const fs = require('fs');
const filePath = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Combine currentMembers and offlineMembers for logic
content = content.replace(
  `const currentTeamSize = myTeam ? 1 + (myTeam.currentMembers?.length || 0) : 0;`,
  `const allTeamMembers = myTeam ? [...(myTeam.currentMembers || []), ...(myTeam.offlineMembers || [])] : [];\n  const currentTeamSize = myTeam ? 1 + allTeamMembers.length : 0;`
);

// Update handleAddInlineMember
content = content.replace(
  `const allEmails = [user?.email, ...(myTeam.currentMembers || []).map(m => m.email), inlineMember.email].map(e => (e || '').toLowerCase().trim())`,
  `const allEmails = [user?.email, ...allTeamMembers.map(m => m.email), inlineMember.email].map(e => (e || '').toLowerCase().trim())`
);

content = content.replace(
  `      await axios.put(\`http://localhost:5001/api/teams/request/\${myTeam._id || myTeam.id}\`, {
        currentMembers: [...(myTeam.currentMembers || []), newMember]
      })`,
  `      await axios.put(\`http://localhost:5001/api/teams/request/\${myTeam._id || myTeam.id}\`, {
        offlineMembers: [...(myTeam.offlineMembers || []), newMember]
      })`
);

// Update handleRemoveMember
content = content.replace(
  `const updatedMembers = (myTeam.currentMembers || []).filter(m => m.id !== memberId && m._id !== memberId)`,
  `const isOffline = typeof memberId === 'string' && memberId.startsWith('offline_');
      let payload = {};
      if (isOffline) {
        payload.offlineMembers = (myTeam.offlineMembers || []).filter(m => m.id !== memberId && m._id !== memberId);
      } else {
        payload.currentMembers = (myTeam.currentMembers || []).filter(m => m.id !== memberId && m._id !== memberId);
      }`
);

content = content.replace(
  `await axios.put(\`http://localhost:5001/api/teams/request/\${myTeam._id || myTeam.id}\`, {
        currentMembers: updatedMembers
      })`,
  `await axios.put(\`http://localhost:5001/api/teams/request/\${myTeam._id || myTeam.id}\`, payload)`
);

// Update handleSaveEditMember
content = content.replace(
  `const otherEmails = [user?.email, ...(myTeam.currentMembers || []).filter(m => m.id !== memberId && m._id !== memberId).map(m => m.email)].map(e => (e || '').toLowerCase().trim())`,
  `const otherEmails = [user?.email, ...allTeamMembers.filter(m => m.id !== memberId && m._id !== memberId).map(m => m.email)].map(e => (e || '').toLowerCase().trim())`
);

content = content.replace(
  `const updatedMembers = (myTeam.currentMembers || []).map(m => {
        if (m.id === memberId || m._id === memberId) {`,
  `const isOffline = typeof memberId === 'string' && memberId.startsWith('offline_');
      let payload = {};
      if (isOffline) {
        payload.offlineMembers = (myTeam.offlineMembers || []).map(m => {
          if (m.id === memberId || m._id === memberId) {`
);

content = content.replace(
  `        }
        return m
      })
      
      await axios.put(\`http://localhost:5001/api/teams/request/\${myTeam._id || myTeam.id}\`, {
        currentMembers: updatedMembers
      })`,
  `        }
          return m;
        });
      } else {
        payload.currentMembers = (myTeam.currentMembers || []).map(m => {
          if (m.id === memberId || m._id === memberId) {
            return { ...m, name: editMemberData.name.trim(), email: editMemberData.email.trim(), phone: editMemberData.phone.trim() || undefined };
          }
          return m;
        });
      }
      
      await axios.put(\`http://localhost:5001/api/teams/request/\${myTeam._id || myTeam.id}\`, payload)`
);

// Update rendering mapping
content = content.replace(
  `{(myTeam.currentMembers || []).map((m, i) => (`,
  `{allTeamMembers.map((m, i) => (`
);

fs.writeFileSync(filePath, content);
console.log("EventRegistrationPage offline sync fixed.");
