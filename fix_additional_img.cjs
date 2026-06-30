const fs = require('fs');

const files = [
  'src/components/EventCard.jsx',
  'src/pages/HackathonPage.jsx',
  'src/pages/HackathonDetails.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/pages/ClubHeadDashboard.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // replace event.additionalImage with event.additionalImages?.[0] || event.additionalImage
  content = content.replace(/event\.additionalImage(?!s)/g, '(event.additionalImages?.[0] || event.additionalImage)');
  // replace h.additionalImage with h.additionalImages?.[0] || h.additionalImage
  content = content.replace(/h\.additionalImage(?!s)/g, '(h.additionalImages?.[0] || h.additionalImage)');
  // replace raw.additionalImage with raw.additionalImages?.[0] || raw.additionalImage
  content = content.replace(/raw\.additionalImage(?!s)/g, '(raw.additionalImages?.[0] || raw.additionalImage)');
  // replace e.additionalImage with e.additionalImages?.[0] || e.additionalImage
  content = content.replace(/e\.additionalImage(?!s)/g, '(e.additionalImages?.[0] || e.additionalImage)');

  fs.writeFileSync(file, content);
});

console.log("Fixed additionalImage references");
