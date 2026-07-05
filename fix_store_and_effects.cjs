const fs = require('fs');

// 1. Fix analyticsStore.js to handle "undefined"
const storeFile = 'src/store/analyticsStore.js';
let storeContent = fs.readFileSync(storeFile, 'utf8');

storeContent = storeContent.replace(
  /if \(\!userId\) return;/,
  `if (!userId || userId === 'undefined') return;`
);
storeContent = storeContent.replace(
  /if \(\!clubId\) return;/,
  `if (!clubId || clubId === 'undefined') return;`
);

fs.writeFileSync(storeFile, storeContent);

// 2. Fix StudentDashboard.jsx
const studentDash = 'src/pages/StudentDashboard.jsx';
let sdContent = fs.readFileSync(studentDash, 'utf8');
sdContent = sdContent.replace(
  /useEffect\(\(\) => \{\n\s*fetchHackathonData\?\.\(\)\n\s*if \(user\?._id\) \{\n\s*fetchStudentRegistrations\?\.\(user\._id\)\n\s*fetchStudentAnalytics\?\.\(user\?._id\)\n\s*\}\n\s*\}, \[user\]\)/,
  `useEffect(() => {
    fetchHackathonData?.()
    if (user?._id) {
      fetchStudentRegistrations?.(user._id)
      fetchStudentAnalytics?.(user._id)
    }
  }, [user])`
);
fs.writeFileSync(studentDash, sdContent);

// 3. Fix StudentProfilePage.jsx
const studentProfile = 'src/pages/StudentProfilePage.jsx';
let spContent = fs.readFileSync(studentProfile, 'utf8');
spContent = spContent.replace(
  /useEffect\(\(\) => \{\n\s*fetchStudentRegistrations\?\.\(user\?\._id\)\n\s*fetchStudentAnalytics\?\.\(user\?\._id\)\n\s*\}, \[user\]\)/,
  `useEffect(() => {
    if (user?._id) {
      fetchStudentRegistrations?.(user._id)
      fetchStudentAnalytics?.(user._id)
    }
  }, [user])`
);
fs.writeFileSync(studentProfile, spContent);

// 4. Fix ClubHeadDashboard.jsx
const clubHeadDash = 'src/pages/ClubHeadDashboard.jsx';
let chdContent = fs.readFileSync(clubHeadDash, 'utf8');
chdContent = chdContent.replace(
  /useEffect\(\(\) => \{\n\s*fetchEvents\(\)\n\s*fetchClubHeadAnalytics\?\.\(user\?\._id\)\n\s*\}, \[\]\)/,
  `useEffect(() => {
    fetchEvents()
    if (user?._id) {
      fetchClubHeadAnalytics?.(user._id)
    }
  }, [user])`
);
fs.writeFileSync(clubHeadDash, chdContent);

// 5. Fix ClubHeadProfilePage.jsx
const clubHeadProfile = 'src/pages/ClubHeadProfilePage.jsx';
let chpContent = fs.readFileSync(clubHeadProfile, 'utf8');
chpContent = chpContent.replace(
  /useEffect\(\(\) => \{\n\s*fetchClubHeadAnalytics\?\.\(user\?\._id\)\n\s*\}, \[\]\)/,
  `useEffect(() => {
    if (user?._id) {
      fetchClubHeadAnalytics?.(user._id)
    }
  }, [user])`
);
fs.writeFileSync(clubHeadProfile, chpContent);

console.log('Fixed undefined userId issue.');
