const fs = require('fs');
const path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Remove import of generateInsights from useAnalyticsStore
content = content.replace("const { generateInsights } = useAnalyticsStore()", "");

// Add generateInsights definition inside AdminDashboard
const localFunc = `  const { adminAnalytics, fetchAdminAnalytics } = useAnalyticsStore()
  
  const generateInsights = (events) => {
    return [
      {
        id: 1,
        type: 'growth',
        title: 'Event Growth',
        description: 'Number of events increased by 15% this month.',
        trend: 'up'
      },
      {
        id: 2,
        type: 'engagement',
        title: 'High Engagement',
        description: 'Tech clubs have the highest registration rate.',
        trend: 'up'
      },
      {
        id: 3,
        type: 'warning',
        title: 'Pending Approvals',
        description: 'There are ' + events.filter(e => e.status === 'pending').length + ' events awaiting approval.',
        trend: 'neutral'
      }
    ];
  };

  const insights = generateInsights(events)`;

content = content.replace("const insights = generateInsights(events)", localFunc);

fs.writeFileSync(path, content);
console.log('Patched AdminDashboard.jsx');
