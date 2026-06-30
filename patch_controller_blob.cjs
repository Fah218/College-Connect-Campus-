const fs = require('fs');
const path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

// For createEvent
content = content.replace(
  `let eventData = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;`,
  `let eventData = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;
    
    // Prevent blob URLs from being saved
    if (eventData.bannerImage && eventData.bannerImage.startsWith('blob:')) delete eventData.bannerImage;
    if (eventData.additionalImage && eventData.additionalImage.startsWith('blob:')) delete eventData.additionalImage;
    if (eventData.additionalImages) {
       eventData.additionalImages = eventData.additionalImages.filter(img => !img.startsWith('blob:'));
    }`
);

// For updateEvent
content = content.replace(
  `let updates = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;`,
  `let updates = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;
    
    // Prevent blob URLs from being saved
    if (updates.bannerImage && updates.bannerImage.startsWith('blob:')) delete updates.bannerImage;
    if (updates.additionalImage && updates.additionalImage.startsWith('blob:')) delete updates.additionalImage;
    if (updates.additionalImages) {
       updates.additionalImages = updates.additionalImages.filter(img => !img.startsWith('blob:'));
    }`
);

fs.writeFileSync(path, content);
console.log("Patched eventController.js to strip blobs");
