const fs = require('fs');
const file = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add isHackathon constant
content = content.replace(
  `  const isIndividualHackathon = event.teamSizeMin === 1 && event.maxTeamSize === 1;`,
  `  const isHackathon = event.category === 'Hackathon';\n  const isIndividualHackathon = event.teamSizeMin === 1 && event.maxTeamSize === 1;`
);

// Update addOfflineMember
content = content.replace(
  `members: [...offlineTeamData.members, { name: '', email: '', phone: '' }]`,
  `members: [...offlineTeamData.members, { name: '', email: '', phone: '', department: '', year: '' }]`
);

// Update inlineMember state
content = content.replace(
  `const [inlineMember, setInlineMember] = useState({ name: '', email: '', phone: '' })`,
  `const [inlineMember, setInlineMember] = useState({ name: '', email: '', phone: '', department: '', year: '' })`
);

// We need to write a brand new handleNonHackathonTeamRegistration
const handleFunc = `  const handleNonHackathonTeamRegistration = async (e) => {
    e.preventDefault();
    const totalSize = 1 + offlineTeamData.members.length;
    if (totalSize < (event.teamSizeMin || 1) || totalSize > (event.maxTeamSize || 99)) {
      return setErrorMsg(\`Team size must be between \${event.teamSizeMin || 1} and \${event.maxTeamSize || 'Unlimited'}.\`);
    }

    const allEmails = [user?.email, ...offlineTeamData.members.map(m => m.email)].map(e => (e || '').toLowerCase().trim());
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.length) {
      return setErrorMsg('Duplicate emails are not allowed, and members cannot use the Team Lead\\'s email.');
    }

    for (const m of offlineTeamData.members) {
      if (!m.name.trim() || !m.email.trim() || !m.phone.trim() || !m.department.trim() || !m.year.trim()) {
        return setErrorMsg('All members must have Full Name, Email, Phone, Department, and Year filled out.');
      }
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const leader = {
        name: user?.name,
        email: user?.email,
        phone: formData.phone || user?.phone || '',
        department: formData.department || user?.department || '',
        year: formData.year || user?.year || '',
        role: 'Leader'
      };

      const members = offlineTeamData.members.map(m => ({
        name: m.name.trim(),
        email: m.email.trim(),
        phone: m.phone.trim(),
        department: m.department.trim(),
        year: m.year.trim(),
        role: 'Member'
      }));

      const teamDetails = {
        teamName: offlineTeamData.title.trim(),
        members: [leader, ...members]
      };

      await registerTeam(event.id || event._id, null, user?.id || user?._id, teamDetails);
      setSuccess(true);
      setTimeout(() => navigate('/student-dashboard'), 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to register team');
    } finally {
      setLoading(false);
    }
  };

`;

const insertIndex = content.indexOf('  const handleCreateOfflineTeam');
content = content.slice(0, insertIndex) + handleFunc + content.slice(insertIndex);

// Let's replace the whole condition rendering block to handle isHackathon
// Find the block where `if (isTeamHackathon)` starts in the right col
fs.writeFileSync(file, content);
console.log("Patched constants and handlers");
