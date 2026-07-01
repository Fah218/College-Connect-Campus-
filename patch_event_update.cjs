const fs = require('fs');
let path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
          if (typeof id === 'string') {
            const fd = new FormData();
            
            // Extract file objects
            const bannerFile = updates.bannerImageFile;
            const additionalFiles = updates.additionalImageFile; // note this is often an array or a single file
            
            // Remove file objects from updates to avoid circular JSON
            const cleanUpdates = { ...updates, status: 'pending' };
            delete cleanUpdates.bannerImageFile;
            delete cleanUpdates.additionalImageFile;
            
            fd.append('eventData', JSON.stringify(cleanUpdates));
            
            if (bannerFile) fd.append('bannerImage', bannerFile);
            if (additionalFiles && additionalFiles.length) {
              for(let i=0; i<additionalFiles.length; i++) {
                fd.append('additionalImages', additionalFiles[i]);
              }
            } else if (additionalFiles) {
              fd.append('additionalImages', additionalFiles);
            }

            await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
              // axios automatically sets multipart boundary
            });
          }
`;

content = content.replace(
  `          if (typeof id === 'string') {
            await axios.put(\`http://localhost:5001/api/events/\${id}\`, { 
              ...updates,
              status: 'pending' // Re-evaluate upon edit
            });
          }`,
  replacement.trim()
);

fs.writeFileSync(path, content);
console.log("Patched updateEvent in eventStore");
