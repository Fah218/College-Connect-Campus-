const fs = require('fs');
const filePath = 'backend/controllers/eventController.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldSave = `    const newEvent = new Event(eventData);
    await newEvent.save();
    
    res.status(201).json({`;
const newSave = `    console.log("---- ABOUT TO SAVE TO MONGODB ----");
    console.log("eventData being saved:", JSON.stringify(eventData, null, 2));
    const newEvent = new Event(eventData);
    await newEvent.save();
    console.log("---- SUCCESSFULLY SAVED TO MONGODB ----", newEvent._id);
    
    res.status(201).json({`;

if (content.includes(oldSave)) {
  content = content.replace(oldSave, newSave);
  fs.writeFileSync(filePath, content);
  console.log("Added MongoDB logs to eventController.js!");
} else {
  console.log("Failed to add logs.");
}
