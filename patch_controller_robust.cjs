const fs = require('fs');
const path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `    let eventData = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;`,
  `    let eventData = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;
    console.log("---- RECEIVED EVENT CREATION ----");
    console.log("Is Multipart?", !!req.body.eventData);
    console.log("Files received:", req.files ? Object.keys(req.files) : 'None');`
);

fs.writeFileSync(path, content);
console.log("Patched robust logging");
