const fs = require('fs');
const path = 'src/pages/StudentProfilePage.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const uniqueClubs = Array\.from\(\{ length: studentAnalytics\?\.profile\?\.distinctClubsCount \|\| 0 \}\)\.map\(\(_, i\) => 'Club ' \+ \(i\+1\)\);[\s\S]*?\/\/ 5\. Hackathon Experience/,
  "const uniqueClubs = studentAnalytics?.profile?.uniqueClubs || [];\n\n  // 5. Hackathon Experience"
);

content = content.replace(
  /const participationCounts = \{\}[\s\S]*?\[\]/,
  "const participationData = studentAnalytics?.profile?.participationData || []"
);

fs.writeFileSync(path, content);
console.log('Successfully updated StudentProfilePage.jsx');
