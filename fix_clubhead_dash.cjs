const fs = require('fs');

const file = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import store
content = content.replace(
  /import { useEventStore } from '\.\.\/store\/eventStore'/,
  `import { useEventStore } from '../store/eventStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'`
);

// 2. Destructure
content = content.replace(
  /const \{ user \} = useAuthStore\(\)/,
  `const { user } = useAuthStore()\n  const { clubHeadAnalytics, fetchClubHeadAnalytics } = useAnalyticsStore()`
);

// 3. fetch in useEffect
content = content.replace(
  /fetchEvents\(\)/,
  `fetchEvents()\n    fetchClubHeadAnalytics?.()`
);

// 4. Update Stats Cards
content = content.replace(
  /<StatCard icon=\{Calendar\} title="Total Events" value=\{myEvents\.length\} color="primary" \/>/,
  `<StatCard icon={Calendar} title="Total Events" value={clubHeadAnalytics?.dashboard?.totalEvents || 0} color="primary" />`
);

content = content.replace(
  /<StatCard icon=\{CheckCircle\} title="Approved" value=\{approvedEvents\.length\} color="green" \/>/,
  `<StatCard icon={CheckCircle} title="Approved" value={clubHeadAnalytics?.dashboard?.approved || 0} color="green" />`
);

content = content.replace(
  /<StatCard icon=\{Clock\} title="Pending Approval" value=\{pendingEvents\.length\} color="orange" \/>/,
  `<StatCard icon={Clock} title="Pending Approval" value={clubHeadAnalytics?.dashboard?.pendingApproval || 0} color="orange" />`
);

content = content.replace(
  /<StatCard icon=\{Users\} title="Total Attendees" value=\{myEvents\.reduce\(\(sum, e\) => sum \+ \(e\.totalParticipants \|\| 0\), 0\)\} color="purple" \/>/,
  `<StatCard icon={Users} title="Total Attendees" value={clubHeadAnalytics?.dashboard?.totalAttendees || 0} color="purple" />`
);

fs.writeFileSync(file, content);
console.log('Fixed ClubHeadDashboard.jsx');
