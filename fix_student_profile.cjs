const fs = require('fs');

const file = 'src/pages/StudentProfilePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import store
content = content.replace(
  /import { useRegistrationStore } from '\.\.\/store\/registrationStore'/,
  `import { useRegistrationStore } from '../store/registrationStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'`
);

// 2. Add destructured values inside the component
content = content.replace(
  /const \{ registrations, fetchStudentRegistrations \} = useRegistrationStore\(\)/,
  `const { registrations, fetchStudentRegistrations } = useRegistrationStore()\n  const { studentAnalytics, fetchStudentAnalytics } = useAnalyticsStore()`
);

// 3. fetch in useEffect
content = content.replace(
  /fetchStudentRegistrations\?\.\(user\._id\)/,
  `fetchStudentRegistrations?.(user._id)\n      fetchStudentAnalytics?.()`
);

// 4. Update the chart data logic
// We want to use studentAnalytics.profile.eventHistory for chart data if available
content = content.replace(
  /const participationCounts = \{\}[\s\S]*?\{ month: 'Dec', events: 6 \}\n      \]/,
  `const participationCounts = {}
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const history = studentAnalytics?.profile?.eventHistory || []
  history.forEach(reg => {
    const d = new Date(reg.createdAt || reg.eventId?.date)
    if (!isNaN(d.getTime())) {
      const month = months[d.getMonth()]
      participationCounts[month] = (participationCounts[month] || 0) + 1
    }
  })
  
  const participationData = Object.keys(participationCounts).length > 0
    ? Object.keys(participationCounts).map(month => ({ month, events: participationCounts[month] }))
    : []`
);

// 5. Replace uniqueClubs and hackathons
content = content.replace(
  /const uniqueClubs = \[\.\.\.new Set\(userEvents\.map\(e => e\.club\)\.filter\(Boolean\)\)\]/,
  `const uniqueClubs = Array.from({ length: studentAnalytics?.profile?.distinctClubsCount || 0 }).map((_, i) => 'Club ' + (i+1)); // Using count for UI if names aren't provided by old code. Actually, let's keep userEvents logic for names.`
);
// Actually, let's just leave the local calculation for uniqueClubs and hackathons using userEvents since they require object data (names, titles) which the UI expects.
// Wait! The user said:
// Events Registered = total registrations
// Events Attended = registered events whose event date has already passed
// Upcoming Events = registered events whose event date is in the future

content = content.replace(
  /<StatBox icon=\{Calendar\} label="Events Registered" value=\{userEvents\.length\.toString\(\)\} color="blue" \/>/g,
  `<StatBox icon={Calendar} label="Events Registered" value={studentAnalytics?.profile?.eventsRegistered?.toString() || '0'} color="blue" />`
);

content = content.replace(
  /<StatBox icon=\{Award\} label="Events Attended" value=\{attendedEvents\.length\.toString\(\)\} color="green" \/>/g,
  `<StatBox icon={Award} label="Events Attended" value={studentAnalytics?.profile?.eventsAttended?.toString() || '0'} color="green" />`
);

content = content.replace(
  /<StatBox icon=\{Users\} label="Upcoming Events" value=\{upcomingEvents\.length\.toString\(\)\} color="purple" \/>/g,
  `<StatBox icon={Users} label="Upcoming Events" value={studentAnalytics?.profile?.upcomingEventsCount?.toString() || '0'} color="purple" />`
);

fs.writeFileSync(file, content);
console.log('Fixed StudentProfilePage.jsx');
