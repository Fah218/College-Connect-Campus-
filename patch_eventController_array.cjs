const fs = require('fs');
let path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        updates.additionalImages = [];
        updates.additionalImagesPublicIds = [];
        for (const file of req.files.additionalImages) {
          const res = await uploadToCloudinary(file);
          updates.additionalImages.push(res.url);
          updates.additionalImagesPublicIds.push(res.public_id);
        }
      }
`;

const newCode = `
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        if (!updates.additionalImages) updates.additionalImages = [];
        if (!updates.additionalImagesPublicIds) updates.additionalImagesPublicIds = [];
        for (const file of req.files.additionalImages) {
          const res = await uploadToCloudinary(file);
          updates.additionalImages.push(res.url);
          updates.additionalImagesPublicIds.push(res.public_id);
        }
      }
`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(path, content);
console.log("Patched eventController to append images instead of overwriting");
