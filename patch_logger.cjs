const fs = require('fs');
const path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `export const createEvent = async (req, res) => {\n  try {`,
  `export const createEvent = async (req, res) => {\n  try {\n    console.log("---- CREATE EVENT HEADERS ----", req.headers);\n    console.log("---- CREATE EVENT FILES ----", !!req.files, req.files ? Object.keys(req.files) : 'No files');\n    console.log("---- CREATE EVENT BODY ----", !!req.body, Object.keys(req.body));`
);

fs.writeFileSync(path, content);
console.log("Patched logger");
