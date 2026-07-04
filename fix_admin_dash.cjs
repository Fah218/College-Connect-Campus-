const fs = require('fs');

const file = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import store
content = content.replace(
  /import { useEventStore } from '\.\.\/store\/eventStore'/,
  `import { useEventStore } from '../store/eventStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'`
);

// 2. Destructure
content = content.replace(
  /const \{ events, updateEventStatus \} = useEventStore\(\)/,
  `const { events, updateEventStatus } = useEventStore()\n  const { adminAnalytics, fetchAdminAnalytics } = useAnalyticsStore()`
);

// 3. fetch in useEffect
content = content.replace(
  /fetchEvents\(\)/,
  `fetchEvents()\n    fetchAdminAnalytics?.()`
);

// 4. Update Stats Cards
content = content.replace(
  /<StatCard icon=\{Calendar\} title="Total Events" value=\{events\.length\} color="primary" \/>/,
  `<StatCard icon={Calendar} title="Total Events" value={adminAnalytics?.dashboard?.totalEvents || 0} color="primary" />`
);

content = content.replace(
  /<StatCard icon=\{CheckCircle\} title="Approved" value=\{approvedEvents\.length\} color="green" \/>/,
  `<StatCard icon={CheckCircle} title="Approved" value={adminAnalytics?.dashboard?.approved || 0} color="green" />`
);

content = content.replace(
  /<StatCard icon=\{Users\} title="Total Registrations" value=\{adminStats\.totalRegistrations\} color="blue" \/>/,
  `<StatCard icon={Users} title="Total Registrations" value={adminAnalytics?.dashboard?.totalRegistrations || 0} color="blue" />`
);

content = content.replace(
  /<StatCard icon=\{Users\} title="Total Participants" value=\{adminStats\.totalParticipants\} color="purple" \/>/,
  `<StatCard icon={Users} title="Total Participants" value={adminAnalytics?.dashboard?.totalParticipants || 0} color="purple" />`
);

fs.writeFileSync(file, content);
console.log('Fixed AdminDashboard.jsx');
