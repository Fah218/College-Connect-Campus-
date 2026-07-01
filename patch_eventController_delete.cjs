const fs = require('fs');
let path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `
    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
`;

const newCode = `
    // Process explicit deletions of old gallery images
    if (updates.deletedImagesPublicIds && updates.deletedImagesPublicIds.length > 0) {
      for (const publicId of updates.deletedImagesPublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', publicId, err);
        }
      }
    }
    // Clean up payload so it doesn't get saved to mongo
    delete updates.deletedImagesPublicIds;

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(path, content);
console.log("Patched eventController for gallery deletion");
