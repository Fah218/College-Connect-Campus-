const fs = require('fs');
const filePath = '/Users/fahadfurquan/.gemini/antigravity/brain/7570c99c-d9c1-45bd-a285-3f15495904ee/task.md';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/- \[\s\] /g, '- [x] ');

fs.writeFileSync(filePath, content);
console.log("task.md updated successfully.");
