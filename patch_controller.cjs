const fs = require('fs');
const path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import cloudinary')) {
  content = content.replace(
    `import fs from 'fs';`,
    `import fs from 'fs';\nimport cloudinary from '../config/cloudinary.js';`
  );
}

// Helper to upload to Cloudinary and delete local
const uploadLogic = `
    const uploadToCloudinary = async (file) => {
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
    };

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        const res = await uploadToCloudinary(req.files.bannerImage[0]);
        eventData.bannerImage = res.url;
        eventData.bannerImagePublicId = res.public_id;
      }
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        eventData.additionalImages = [];
        eventData.additionalImagesPublicIds = [];
        for (const file of req.files.additionalImages) {
          const res = await uploadToCloudinary(file);
          eventData.additionalImages.push(res.url);
          eventData.additionalImagesPublicIds.push(res.public_id);
        }
      }
    }
`;

const uploadLogicUpdate = `
    const uploadToCloudinary = async (file) => {
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
    };

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        const res = await uploadToCloudinary(req.files.bannerImage[0]);
        updates.bannerImage = res.url;
        updates.bannerImagePublicId = res.public_id;
      }
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        updates.additionalImages = [];
        updates.additionalImagesPublicIds = [];
        for (const file of req.files.additionalImages) {
          const res = await uploadToCloudinary(file);
          updates.additionalImages.push(res.url);
          updates.additionalImagesPublicIds.push(res.public_id);
        }
      }
    }
`;

// Replace createEvent upload logic
content = content.replace(
  `    if (req.files) {\n      if (req.files.bannerImage) {\n        eventData.bannerImage = 'http://localhost:5001/uploads/events/' + req.files.bannerImage[0].filename;\n      }\n      if (req.files.additionalImages) {\n        eventData.additionalImages = req.files.additionalImages.map(file => 'http://localhost:5001/uploads/events/' + file.filename);\n      }\n    }`,
  uploadLogic
);

// Replace updateEvent upload logic
content = content.replace(
  `    if (req.files) {\n      if (req.files.bannerImage) {\n        updates.bannerImage = 'http://localhost:5001/uploads/events/' + req.files.bannerImage[0].filename;\n      }\n      if (req.files.additionalImages) {\n        updates.additionalImages = req.files.additionalImages.map(file => 'http://localhost:5001/uploads/events/' + file.filename);\n      }\n    }`,
  uploadLogicUpdate
);

// Add Cloudinary deletion to deleteEvent
content = content.replace(
  `    // Helper to delete file\n    const deleteFile = (fileUrl) => {\n      if (fileUrl && fileUrl.includes('/uploads/events/')) {\n        const filename = fileUrl.split('/uploads/events/')[1];\n        const filepath = path.join(process.cwd(), 'uploads/events', filename);\n        if (fs.existsSync(filepath)) {\n          fs.unlinkSync(filepath);\n        }\n      }\n    };`,
  `    // Helper to delete file locally (for backward compatibility)\n    const deleteFile = (fileUrl) => {\n      if (fileUrl && fileUrl.includes('/uploads/events/')) {\n        const filename = fileUrl.split('/uploads/events/')[1];\n        const filepath = path.join(process.cwd(), 'uploads/events', filename);\n        if (fs.existsSync(filepath)) {\n          fs.unlinkSync(filepath);\n        }\n      }\n    };\n\n    // Delete from Cloudinary\n    if (event.bannerImagePublicId) {\n      await cloudinary.uploader.destroy(event.bannerImagePublicId);\n    }\n    if (event.additionalImagesPublicIds && event.additionalImagesPublicIds.length > 0) {\n      for (const pubId of event.additionalImagesPublicIds) {\n        await cloudinary.uploader.destroy(pubId);\n      }\n    }`
);

fs.writeFileSync(path, content);
console.log("Patched eventController.js for Cloudinary");
