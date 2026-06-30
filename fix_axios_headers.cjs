const fs = require('fs');
const path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /, {[\s\n]*headers: { 'Content-Type': 'multipart\/form-data' }[\s\n]*}/g,
  ''
);

fs.writeFileSync(path, content);
console.log("Fixed axios headers");
