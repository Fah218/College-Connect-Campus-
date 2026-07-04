const fs = require('fs');

const file = 'src/pages/AdminProfilePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import store
content = content.replace(
  /import \{ useAuthStore \} from '\.\.\/store\/authStore'/,
  `import { useAuthStore } from '../store/authStore'\nimport { useAnalyticsStore } from '../store/analyticsStore'`
);

// 2. Destructure
content = content.replace(
  /const \{ user \} = useAuthStore\(\)/,
  `const { user } = useAuthStore()\n  const { adminAnalytics, fetchAdminAnalytics } = useAnalyticsStore()`
);

// 3. fetch in useEffect
content = content.replace(
  /const \[isEditing, setIsEditing\] = useState\(false\)/,
  `const [isEditing, setIsEditing] = useState(false)\n  \n  useEffect(() => {\n    fetchAdminAnalytics?.()\n  }, [])`
);

// 4. Update the chart data logic
content = content.replace(
  /const growthData = \[\s*\{ month: 'Jan', participants: 1200 \},[\s\S]*?\{ month: 'Jun', participants: 3200 \}\s*\]/,
  `const growthData = adminAnalytics?.profile?.growthTrend || []`
);

// 5. Replace hardcoded stats
content = content.replace(
  /<StatBox icon=\{Users\} label="Total Users" value="1,240" color="blue" \/>/,
  `<StatBox icon={Users} label="Total Users" value={adminAnalytics?.profile?.totalUsers?.toString() || '0'} color="blue" />`
);

content = content.replace(
  /<StatBox icon=\{Calendar\} label="Total Events" value="156" color="purple" \/>/,
  `<StatBox icon={Calendar} label="Total Events" value={adminAnalytics?.profile?.totalEvents?.toString() || '0'} color="purple" />`
);

content = content.replace(
  /<StatBox icon=\{ShieldCheck\} label="Total Club Heads" value="24" color="indigo" \/>/,
  `<StatBox icon={ShieldCheck} label="Total Club Heads" value={adminAnalytics?.profile?.totalClubHeads?.toString() || '0'} color="indigo" />`
);

content = content.replace(
  /<p className="text-3xl font-bold text-gray-800 mb-1">342<\/p>/,
  `<p className="text-3xl font-bold text-gray-800 mb-1">{adminAnalytics?.profile?.approvalInsights?.totalRequests || 0}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-green-700 mb-1">280<\/p>/,
  `<p className="text-2xl font-bold text-green-700 mb-1">{adminAnalytics?.profile?.approvalInsights?.approved || 0}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-red-700 mb-1">45<\/p>/,
  `<p className="text-2xl font-bold text-red-700 mb-1">{adminAnalytics?.profile?.approvalInsights?.rejected || 0}</p>`
);

content = content.replace(
  /<p className="text-2xl font-bold text-orange-700 mb-1">17<\/p>/,
  `<p className="text-2xl font-bold text-orange-700 mb-1">{adminAnalytics?.profile?.approvalInsights?.pending || 0}</p>`
);

content = content.replace(
  /<p className="text-4xl font-bold text-blue-700">8,450<\/p>/,
  `<p className="text-4xl font-bold text-blue-700">{adminAnalytics?.profile?.totalStudentParticipation || 0}</p>`
);

content = content.replace(
  /<li>• Annual Tech Fest \(Tech Club\) - <span className="text-gray-400">2h ago<\/span><\/li>\s*<li>• AI Workshop Series \(AI Club\) - <span className="text-gray-400">5h ago<\/span><\/li>\s*<li>• Coding Competition \(Coding Club\) - <span className="text-gray-400">1d ago<\/span><\/li>/,
  `{(adminAnalytics?.profile?.activitySummary?.recentApprovals || []).map((e, idx) => (<li key={idx}>• {e.title} - <span className="text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span></li>))}`
);

content = content.replace(
  /<li>• Midnight Gaming Tournament - <span className="text-gray-400">Justification needed<\/span><\/li>/,
  `{(adminAnalytics?.profile?.activitySummary?.recentRejections || []).map((e, idx) => (<li key={idx}>• {e.title} - <span className="text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span></li>))}`
);

content = content.replace(
  /<span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">24 Active Clubs<\/span>\s*<span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">3 Pending Registration<\/span>/,
  `<span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">{adminAnalytics?.profile?.activitySummary?.clubsManaged || 0} Active Clubs</span>`
);

fs.writeFileSync(file, content);
console.log('Fixed AdminProfilePage.jsx');
