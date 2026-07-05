const fs = require('fs');
const path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("import { useAnalyticsStore } from '../store/analyticsStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'", "import { useAnalyticsStore } from '../store/analyticsStore'");

fs.writeFileSync(path, content);
console.log('Fixed AdminDashboard.jsx');
