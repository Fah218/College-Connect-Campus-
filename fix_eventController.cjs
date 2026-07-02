const fs = require('fs');
const filePath = 'backend/controllers/eventController.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the misplaced deletion logic from createEvent
const badDeletionBlock = `    // Process explicit deletions of old gallery images
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
    delete updates.deletedImagesPublicIds;`;

if (content.includes(badDeletionBlock)) {
  content = content.replace(badDeletionBlock, '');
} else {
  console.log("Could not find bad deletion block in createEvent");
}

// 2. Add the deletion logic to updateEvent right before checking req.files
const updateEventInjectionTarget = `    const uploadToCloudinary = async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'college_campus/events'
        });
        fs.unlinkSync(file.path);
        return { url: result.secure_url, public_id: result.public_id };
      } catch (err) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw err;
      }
    };`;

const goodDeletionBlock = `    // Process explicit deletions of old gallery images
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
    delete updates.deletedImagesPublicIds;`;

if (!content.includes(goodDeletionBlock)) {
    content = content.replace(updateEventInjectionTarget, updateEventInjectionTarget + '\n\n' + goodDeletionBlock);
}

fs.writeFileSync(filePath, content);
console.log("Fixed eventController.js successfully!");
