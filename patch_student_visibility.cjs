const fs = require('fs');

// 1. ExploreEventsPage.jsx
let explorePath = 'src/pages/ExploreEventsPage.jsx';
let exploreContent = fs.readFileSync(explorePath, 'utf8');
exploreContent = exploreContent.replace(
  `const approved = useMemo(() => events, [events])`,
  `const approved = useMemo(() => events.filter(e => e.status === 'approved'), [events])`
);
fs.writeFileSync(explorePath, exploreContent);

// 2. StudentDashboard.jsx
let dashboardPath = 'src/pages/StudentDashboard.jsx';
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
dashboardContent = dashboardContent.replace(
  `const categories = ['all', ...new Set(events.map(e => e.category))]`,
  `const categories = ['all', ...new Set(approvedEvents.map(e => e.category))]`
);
fs.writeFileSync(dashboardPath, dashboardContent);

// 3. EventRegistrationPage.jsx
let eventRegPath = 'src/pages/EventRegistrationPage.jsx';
let eventRegContent = fs.readFileSync(eventRegPath, 'utf8');
if (!eventRegContent.includes('Event not found or access denied')) {
  eventRegContent = eventRegContent.replace(
    `  if (!event) return <div>Event not found</div>`,
    `  if (!event) return <div>Event not found</div>\n  if (user?.role === 'student' && event.status !== 'approved') return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 font-bold text-xl">Access Denied: Event not approved.</div>`
  );
  fs.writeFileSync(eventRegPath, eventRegContent);
}

// 4. HackathonDetails.jsx
let hackathonPath = 'src/pages/HackathonDetails.jsx';
let hackathonContent = fs.readFileSync(hackathonPath, 'utf8');
if (!hackathonContent.includes('Access Denied: Hackathon not approved.')) {
  hackathonContent = hackathonContent.replace(
    `  if (!h) return <div>Hackathon not found</div>`,
    `  if (!h) return <div>Hackathon not found</div>\n  if (user?.role === 'student' && h.status !== 'approved') return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 font-bold text-xl">Access Denied: Hackathon not approved.</div>`
  );
  fs.writeFileSync(hackathonPath, hackathonContent);
}

console.log("Patched visibility for students");
