const fs = require('fs');

const file = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Import analytics store
content = content.replace(
  /import { useRegistrationStore } from '\.\.\/store\/registrationStore'/,
  `import { useRegistrationStore } from '../store/registrationStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'`
);

// Destructure from analytics store
content = content.replace(
  /const { registrations, fetchStudentRegistrations } = useRegistrationStore\(\)/,
  `const { registrations, fetchStudentRegistrations } = useRegistrationStore()\n  const { studentAnalytics, fetchStudentAnalytics } = useAnalyticsStore()`
);

// Fetch analytics on mount
content = content.replace(
  /fetchStudentRegistrations\?\.\(user\._id\)/,
  `fetchStudentRegistrations?.(user._id)\n      fetchStudentAnalytics?.()`
);

// Replace hardcoded stats variables with analytics values
content = content.replace(
  /<StatCard\s*icon=\{Calendar\}\s*title="Registered Events"\s*value=\{registeredEvents\.length\}\s*color="primary"\s*\/>/g,
  `<StatCard
            icon={Calendar}
            title="Registered Events"
            value={studentAnalytics?.dashboard?.registeredEvents || 0}
            color="primary"
          />`
);

content = content.replace(
  /<StatCard\s*icon=\{Trophy\}\s*title="Joined Hackathons"\s*value=\{joinedHackathonsCount\}\s*color="green"\s*\/>/g,
  `<StatCard
            icon={Trophy}
            title="Joined Hackathons"
            value={studentAnalytics?.dashboard?.joinedHackathons || 0}
            color="green"
          />`
);

content = content.replace(
  /<StatCard\s*icon=\{Users\}\s*title="Team Invitations"\s*value=\{teamInvitationsCount\}\s*color="purple"\s*\/>/g,
  `<StatCard
            icon={Users}
            title="Team Invitations"
            value={studentAnalytics?.dashboard?.teamInvitations || 0}
            color="purple"
          />`
);

content = content.replace(
  /<StatCard\s*icon=\{Calendar\}\s*title="Upcoming Events"\s*value=\{upcomingEventsCount\}\s*color="orange"\s*\/>/g,
  `<StatCard
            icon={Calendar}
            title="Upcoming Events"
            value={studentAnalytics?.dashboard?.upcomingEventsCount || 0}
            color="orange"
          />`
);

fs.writeFileSync(file, content);
console.log('Fixed StudentDashboard.jsx');
