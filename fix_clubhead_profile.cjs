const fs = require('fs');

const file = 'src/pages/ClubHeadProfilePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import store
content = content.replace(
  /import \{ useEventStore \} from '\.\.\/store\/eventStore'/,
  `import { useEventStore } from '../store/eventStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'`
);

// 2. Destructure
content = content.replace(
  /const \{ events \} = useEventStore\(\)/,
  `const { events } = useEventStore()\n  const { clubHeadAnalytics, fetchClubHeadAnalytics } = useAnalyticsStore()`
);

// 3. fetch in useEffect
content = content.replace(
  /fetchEvents\(\)/,
  `fetchEvents()\n    fetchClubHeadAnalytics?.()`
);

// 4. Replace hardcoded stats
content = content.replace(
  /<p className="text-4xl font-bold text-gray-800 mb-2">\{myEvents\.length\}<\/p>/g,
  `<p className="text-4xl font-bold text-gray-800 mb-2">{clubHeadAnalytics?.profile?.totalEvents || 0}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-green-700 mb-1">\{myEvents\.filter\(e => e\.status === 'approved'\)\.length\}<\/p>/g,
  `<p className="text-2xl font-bold text-green-700 mb-1">{clubHeadAnalytics?.profile?.approved || 0}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-orange-700 mb-1">\{myEvents\.filter\(e => e\.status === 'pending'\)\.length\}<\/p>/g,
  `<p className="text-2xl font-bold text-orange-700 mb-1">{clubHeadAnalytics?.profile?.pending || 0}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-red-700 mb-1">\{myEvents\.filter\(e => e\.status === 'rejected'\)\.length\}<\/p>/g,
  `<p className="text-2xl font-bold text-red-700 mb-1">{clubHeadAnalytics?.profile?.rejected || 0}</p>`
);

content = content.replace(
  /<p className="text-lg font-bold text-gray-800">\{topEvent \? topEvent\.title : 'No events yet'\}<\/p>/g,
  `<p className="text-lg font-bold text-gray-800">{clubHeadAnalytics?.profile?.topPerformingEvent?.title || 'No events yet'}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-gray-800">\{maxRegistrations\} <span className="text-sm font-normal text-gray-600">users<\/span><\/p>/g,
  `<p className="text-2xl font-bold text-gray-800">{clubHeadAnalytics?.profile?.mostRegistrations || 0} <span className="text-sm font-normal text-gray-600">users</span></p>`
);

fs.writeFileSync(file, content);
console.log('Fixed ClubHeadProfilePage.jsx');
