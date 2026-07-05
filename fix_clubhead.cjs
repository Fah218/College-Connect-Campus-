const fs = require('fs');
const path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix duplicate import
content = content.replace("import { useAnalyticsStore } from '../store/analyticsStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'", "import { useAnalyticsStore } from '../store/analyticsStore'");

// Fix duplicate hook call in ClubHeadDashboard component
content = content.replace("const { predictAttendance } = useAnalyticsStore()\n", "");
content = content.replace("const { clubHeadAnalytics, fetchClubHeadAnalytics } = useAnalyticsStore()", "const { clubHeadAnalytics, fetchClubHeadAnalytics, predictAttendance } = useAnalyticsStore()");

fs.writeFileSync(path, content);
console.log('Fixed ClubHeadDashboard.jsx');
