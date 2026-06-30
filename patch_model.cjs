const fs = require('fs');
const path = 'backend/models/Event.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('bannerImagePublicId')) {
  content = content.replace(
    'bannerImage: { type: String },',
    'bannerImage: { type: String },\n  bannerImagePublicId: { type: String },'
  );
}
if (!content.includes('additionalImagesPublicIds')) {
  content = content.replace(
    'additionalImages: [{ type: String }],',
    'additionalImages: [{ type: String }],\n  additionalImagesPublicIds: [{ type: String }],'
  );
}

fs.writeFileSync(path, content);
console.log("Patched Event.js");
