const fs = require('fs');

function replaceCall(file, match, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(match, replacement);
  fs.writeFileSync(file, content);
}

replaceCall('src/pages/StudentDashboard.jsx', /fetchStudentAnalytics\?\.\(\)/, 'fetchStudentAnalytics?.(user?._id)');
replaceCall('src/pages/StudentProfilePage.jsx', /fetchStudentAnalytics\?\.\(\)/, 'fetchStudentAnalytics?.(user?._id)');
replaceCall('src/pages/ClubHeadDashboard.jsx', /fetchClubHeadAnalytics\?\.\(\)/, 'fetchClubHeadAnalytics?.(user?._id)');
replaceCall('src/pages/ClubHeadProfilePage.jsx', /fetchClubHeadAnalytics\?\.\(\)/, 'fetchClubHeadAnalytics?.(user?._id)');

console.log('Fixed dashboard calls.');
