const fs = require('fs');
const filePath = 'src/store/eventStore.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the block in updateEvent
const targetBlock = `            if (additionalFiles && additionalFiles.length) {
              for(let i=0; i<additionalFiles.length; i++) {
                fd.append('additionalImages', additionalFiles[i]);
              }
            } else if (additionalFiles) {
              fd.append('additionalImages', additionalFiles);
            }`;

const replaceBlock = `            if (additionalFiles && additionalFiles.length) {
              for(let i=0; i<additionalFiles.length; i++) {
                fd.append('additionalImages', additionalFiles[i]);
              }
            } else if (additionalFiles) {
              fd.append('additionalImages', additionalFiles);
            }
            if (additionalImageFilesArr) {
              for(let i=0; i<additionalImageFilesArr.length; i++) {
                fd.append('additionalImages', additionalImageFilesArr[i]);
              }
            }`;

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replaceBlock);
  fs.writeFileSync(filePath, content);
  console.log("Successfully fixed eventStore.js!");
} else {
  console.log("Could not find the target block to replace.");
}
