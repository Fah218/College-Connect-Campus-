const fs = require('fs');
const path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("value={clubHeadAnalytics?.dashboard?.pendingApproval || 0}", "value={clubHeadAnalytics?.dashboard?.pending || 0}");
content = content.replace("value={clubHeadAnalytics?.dashboard?.totalAttendees || 0}", "value={clubHeadAnalytics?.dashboard?.totalParticipants || 0}");

fs.writeFileSync(path, content);
console.log('Successfully updated ClubHeadDashboard.jsx');
