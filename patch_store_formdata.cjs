const fs = require('fs');
const path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

// Replace addEvent post
content = content.replace(
  /const response = await axios\.post\('http:\/\/localhost:5001\/api\/events\/create', payload\);/g,
  `const fd = new FormData();
          fd.append('eventData', JSON.stringify(payload));
          if (event.bannerImageFile) fd.append('bannerImage', event.bannerImageFile);
          if (event.additionalImageFile) fd.append('additionalImages', event.additionalImageFile);
          
          const response = await axios.post('http://localhost:5001/api/events/create', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });`
);

// Replace updateEvent put
content = content.replace(
  /const response = await axios\.put\(\`http:\/\/localhost:5001\/api\/events\/\${id}\`, updates\);/g,
  `const fd = new FormData();
          fd.append('eventData', JSON.stringify(updates));
          if (updates.bannerImageFile) fd.append('bannerImage', updates.bannerImageFile);
          if (updates.additionalImageFile) fd.append('additionalImages', updates.additionalImageFile);

          const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });`
);

fs.writeFileSync(path, content);
console.log("Patched eventStore.js to use FormData");
