const fs = require('fs');

// 1. Fix AdminDashboard.jsx
let adminPath = 'src/pages/AdminDashboard.jsx';
let adminContent = fs.readFileSync(adminPath, 'utf8');

adminContent = adminContent.replace(
  /onClick=\{\(\) => setViewerImages\(\[event\.bannerImage\]\); setViewerIndex\(0\);\}/g,
  `onClick={() => { setViewerImages([event.bannerImage]); setViewerIndex(0); }}`
);

adminContent = adminContent.replace(
  /onClick=\{\(\) => setViewerImages\(event\.additionalImages\?\.length \? event\.additionalImages : \[event\.additionalImage\]\.filter\(Boolean\)\); setViewerIndex\(0\);\}/g,
  `onClick={() => { setViewerImages(event.additionalImages?.length ? event.additionalImages : [event.additionalImage].filter(Boolean)); setViewerIndex(0); }}`
);

fs.writeFileSync(adminPath, adminContent);


// 2. Fix ClubHeadDashboard.jsx
let clubPath = 'src/pages/ClubHeadDashboard.jsx';
let clubContent = fs.readFileSync(clubPath, 'utf8');

clubContent = clubContent.replace(
  /capacity: 50,\s*capacity: 50,/,
  `capacity: 50,`
);

fs.writeFileSync(clubPath, clubContent);
console.log("Syntax fixes applied");
