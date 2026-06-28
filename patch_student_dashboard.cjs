const fs = require('fs');
const file = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Check if Timeline is imported
if (!content.includes('import Timeline')) {
  content = content.replace(
    `import RecommendedSection from '../components/RecommendedSection'`,
    `import RecommendedSection from '../components/RecommendedSection'\nimport Timeline from '../components/Timeline'`
  );
  fs.writeFileSync(file, content);
  console.log("Patched StudentDashboard to import Timeline");
} else {
  console.log("Timeline already imported");
}
