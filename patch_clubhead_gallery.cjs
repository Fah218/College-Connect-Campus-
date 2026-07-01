const fs = require('fs');
let path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add handleRemoveExistingImage before handleSubmit
const removeFnCode = `
  const handleRemoveExistingImage = (idx) => {
    const newAdditionalImages = [...(formData.additionalImages || [])];
    const newAdditionalImagesPublicIds = [...(formData.additionalImagesPublicIds || [])];
    const deletedPublicId = newAdditionalImagesPublicIds[idx];
    
    newAdditionalImages.splice(idx, 1);
    newAdditionalImagesPublicIds.splice(idx, 1);
    
    const newDeletedIds = [...(formData.deletedImagesPublicIds || [])];
    if (deletedPublicId) {
       newDeletedIds.push(deletedPublicId);
    }
    
    setFormData({
      ...formData,
      additionalImages: newAdditionalImages,
      additionalImagesPublicIds: newAdditionalImagesPublicIds,
      deletedImagesPublicIds: newDeletedIds
    });
  }
`;

content = content.replace(
  `  const handleSubmit = (e) => {`,
  removeFnCode + `\n  const handleSubmit = (e) => {`
);

// 2. Add JSX to display existing images with delete buttons
const galleryJSX = `
              <div>
                <label className="block text-sm font-medium mb-1">(Optional) Additional Images</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'additionalImage')} className="w-full px-4 py-2 border rounded-lg mb-2" />
                {formData.additionalImages && formData.additionalImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing Gallery Images (Click 'X' to delete):</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {formData.additionalImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-lg border aspect-[4/3]">
                          <img src={imgUrl} alt={\`Gallery \${idx}\`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete Image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
`;

content = content.replace(
  `              <div>
                <label className="block text-sm font-medium mb-1">(Optional) Additional Images</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'additionalImage')} className="w-full px-4 py-2 border rounded-lg" />
              </div>`,
  galleryJSX
);

fs.writeFileSync(path, content);
console.log("Patched ClubHeadDashboard.jsx for gallery management");
