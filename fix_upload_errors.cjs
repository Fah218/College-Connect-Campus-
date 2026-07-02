const fs = require('fs');

// Fix ClubHeadDashboard.jsx
const clubFile = 'src/pages/ClubHeadDashboard.jsx';
let clubContent = fs.readFileSync(clubFile, 'utf8');

const oldEventModalStart = `function EventModal({ event, onClose, onSubmit }) {
  const { events } = useEventStore()`;
const newEventModalStart = `function EventModal({ event, onClose, onSubmit }) {
  const { events, uploadProgress } = useEventStore()`;

if (clubContent.includes(oldEventModalStart)) {
  clubContent = clubContent.replace(oldEventModalStart, newEventModalStart);
  fs.writeFileSync(clubFile, clubContent);
  console.log("Fixed ClubHeadDashboard!");
}

// Fix eventController.js
const controllerFile = 'backend/controllers/eventController.js';
let controllerContent = fs.readFileSync(controllerFile, 'utf8');

const oldCreateEventBadBlock = `    // Process explicit deletions of old gallery images
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

// Wait, last time the string replace failed. Let's do it using regex to be safe.
const regex = /\/\/ Process explicit deletions of old gallery images[\s\S]*?delete updates\.deletedImagesPublicIds;/;
const matches = controllerContent.match(regex);

if (matches && matches.length > 0) {
  // Replace the first occurrence (which is inside createEvent) with an empty string
  controllerContent = controllerContent.replace(regex, '');
  fs.writeFileSync(controllerFile, controllerContent);
  console.log("Fixed eventController.js!");
} else {
  console.log("Could not find the bad block in eventController.js");
}

