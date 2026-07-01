const fs = require('fs');
let path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new state for the image viewer
content = content.replace(
  `  const [modalImageSrc, setModalImageSrc] = useState(null)`,
  `  const [viewerImages, setViewerImages] = useState(null)
  const [viewerIndex, setViewerIndex] = useState(0)`
);

// 2. Refactor the viewer modal JSX
const oldViewerModal = `{modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button onClick={() => setModalImageSrc(null)} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}`;

const newViewerModal = `{viewerImages && viewerImages.length > 0 && (
        <ImageViewer 
          images={viewerImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerImages(null)} 
        />
      )}`;

content = content.replace(oldViewerModal, newViewerModal);

// 3. Update all setModalImageSrc calls
// There are a few inline setModalImageSrc calls in the AdminDashboard table.
content = content.replace(/setModalImageSrc\(event\.bannerImage\)/g, "setViewerImages([event.bannerImage]); setViewerIndex(0);");
content = content.replace(/setModalImageSrc\(\(event\.additionalImages\?\.\[0\] \|\| event\.additionalImage\)\)/g, "setViewerImages(event.additionalImages?.length ? event.additionalImages : [event.additionalImage].filter(Boolean)); setViewerIndex(0);");

// 4. Update AdminEventViewModal to receive onImageClick instead of trying to call undefined setModalImageSrc
content = content.replace(
  `function AdminEventViewModal({ event, onClose, onApprove, onReject }) {`,
  `function AdminEventViewModal({ event, onClose, onApprove, onReject, onImageClick }) {`
);

// Replace the setModalImageSrc inside AdminEventViewModal
content = content.replace(
  /onClick=\{\(\) => setModalImageSrc\(event\.bannerImage\)\}/g,
  `onClick={() => onImageClick([event.bannerImage, ...(event.additionalImages || [])].filter(Boolean), 0)}`
);

content = content.replace(
  /onClick=\{\(\) => setModalImageSrc\(\(event\.additionalImages\?\.\[0\] \|\| event\.additionalImage\)\)\}/g,
  `onClick={() => onImageClick([event.bannerImage, ...(event.additionalImages || [])].filter(Boolean), 1)}`
);

// We need to actually pass onImageClick to AdminEventViewModal
content = content.replace(
  `<AdminEventViewModal
          event={selectedEvent}`,
  `<AdminEventViewModal
          event={selectedEvent}
          onImageClick={(imgs, idx) => { setViewerImages(imgs); setViewerIndex(idx); }}`
);

// Note: I also need to render all additionalImages in the modal gallery, not just the first one.
const oldGalleryHeader = `{event.bannerImage || (event.additionalImages?.[0] || event.additionalImage) ? (
          <div className="flex w-full h-48 rounded-t-2xl overflow-hidden">
            {event.bannerImage && (
              <div className="relative group flex-1 h-full">
                <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => onImageClick([event.bannerImage, ...(event.additionalImages || [])].filter(Boolean), 0)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="text-white w-8 h-8" />
                </button>
              </div>
            )}
            {(event.additionalImages?.[0] || event.additionalImage) && (
              <div className="relative group w-1/3 border-l-2 border-white h-full bg-gray-100">
                <img src={(event.additionalImages?.[0] || event.additionalImage)} alt="Additional" className="w-full h-full object-cover" />
                <button 
                  onClick={() => onImageClick([event.bannerImage, ...(event.additionalImages || [])].filter(Boolean), 1)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="text-white w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        ) : (`;

const newGalleryHeader = `{event.bannerImage || (event.additionalImages && event.additionalImages.length > 0) ? (
          <div className="w-full flex flex-col rounded-t-2xl overflow-hidden">
            <div className="relative group w-full h-64 bg-gray-100">
              {event.bannerImage && (
                <>
                  <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => onImageClick([event.bannerImage, ...(event.additionalImages || [])].filter(Boolean), 0)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 className="text-white w-8 h-8" />
                  </button>
                </>
              )}
            </div>
            {event.additionalImages && event.additionalImages.length > 0 && (
              <div className="grid grid-cols-4 gap-1 mt-1 px-1">
                {event.additionalImages.map((img, idx) => (
                  <div key={idx} className="relative group h-24 bg-gray-100 rounded-md overflow-hidden">
                    <img src={img} alt="Additional" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => onImageClick([event.bannerImage, ...(event.additionalImages || [])].filter(Boolean), event.bannerImage ? idx + 1 : idx)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="text-white w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (`;

content = content.replace(oldGalleryHeader, newGalleryHeader);

fs.writeFileSync(path, content);
console.log("Patched AdminDashboard.jsx for image viewer support");
