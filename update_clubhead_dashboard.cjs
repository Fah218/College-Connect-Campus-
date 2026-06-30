const fs = require('fs');
const path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `    bannerImage: '',`,
  `    bannerImage: '',\n    additionalImage: '',`
);

content = content.replace(
  `<input type="file" accept="image/*" className="w-full px-4 py-2 border rounded-lg" />`,
  `<input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'additionalImage')} className="w-full px-4 py-2 border rounded-lg" />`
);

// also inside edit event payload mapping if it exists
content = content.replace(
  `bannerImage: event.bannerImage || '',`,
  `bannerImage: event.bannerImage || '',\n      additionalImage: event.additionalImage || '',`
);

fs.writeFileSync(path, content);
console.log("Patched ClubHeadDashboard.jsx");
