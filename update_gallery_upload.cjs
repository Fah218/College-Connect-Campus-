const fs = require('fs');

// 1. Update ClubHeadDashboard.jsx
const dashboardPath = 'src/pages/ClubHeadDashboard.jsx';
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Add handleMultipleImageUpload function
if (!dashboardContent.includes('handleMultipleImageUpload')) {
  dashboardContent = dashboardContent.replace(
    'const handleImageUpload = (e, field) => {',
    `const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({
        ...formData,
        additionalImageFiles: files,
        // create object URLs for preview if needed
      });
    }
  }

  const handleImageUpload = (e, field) => {`
  );
}

// Update the additionalImages input to use multiple and handleMultipleImageUpload
const oldInput = `<input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'additionalImage')} className="w-full px-4 py-2 border rounded-lg mb-2" />`;
const newInput = `<input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="w-full px-4 py-2 border rounded-lg mb-2" />
                {formData.additionalImageFiles && formData.additionalImageFiles.length > 0 && (
                  <p className="text-sm text-green-600 mb-2">{formData.additionalImageFiles.length} new image(s) selected.</p>
                )}`;
dashboardContent = dashboardContent.replace(oldInput, newInput);

fs.writeFileSync(dashboardPath, dashboardContent);

// 2. Update eventStore.js to append multiple files
const storePath = 'src/store/eventStore.js';
let storeContent = fs.readFileSync(storePath, 'utf8');

// For addEvent
storeContent = storeContent.replace(
  `if (event.additionalImageFile) fd.append('additionalImages', event.additionalImageFile);`,
  `if (event.additionalImageFile) fd.append('additionalImages', event.additionalImageFile);
          if (event.additionalImageFiles) {
            event.additionalImageFiles.forEach(file => fd.append('additionalImages', file));
          }`
);

// For updateEvent
storeContent = storeContent.replace(
  `const additionalFiles = updates.additionalImageFile;`,
  `const additionalFiles = updates.additionalImageFile;
            const additionalImageFilesArr = updates.additionalImageFiles;`
);

storeContent = storeContent.replace(
  `delete cleanUpdates.additionalImageFile;`,
  `delete cleanUpdates.additionalImageFile;
            delete cleanUpdates.additionalImageFiles;`
);

storeContent = storeContent.replace(
  `if (additionalFiles) fd.append('additionalImages', additionalFiles);`,
  `if (additionalFiles) fd.append('additionalImages', additionalFiles);
            if (additionalImageFilesArr) {
              additionalImageFilesArr.forEach(file => fd.append('additionalImages', file));
            }`
);

fs.writeFileSync(storePath, storeContent);

console.log("Successfully updated frontend multiple image uploads.");
