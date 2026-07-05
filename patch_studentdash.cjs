const fs = require('fs');
const path = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Remove fallback calculations
content = content.replace(/const joinedHackathonsCount = [\s\S]*?size;\n/, '');
content = content.replace(/const teamInvitationsCount = [\s\S]*?length;\n/, '');
content = content.replace(/const upcomingEventsCount = [\s\S]*?\}\)\.length;\n/, '');

fs.writeFileSync(path, content);
console.log('Successfully updated StudentDashboard.jsx');
