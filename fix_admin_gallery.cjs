const fs = require('fs');
const filePath = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the hacked split banner and replace with clean banner + Gallery section
const oldBannerHTML = `{event.bannerImage || (event.additionalImages?.[0] || event.additionalImage) ? (
          <div className="flex w-full h-48 rounded-t-2xl overflow-hidden">
            {event.bannerImage && (
              <div className="relative group flex-1 h-full">
                <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setViewerImages([event.bannerImage]); setViewerIndex(0); }}
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
                  onClick={() => { setViewerImages(event.additionalImages?.length ? event.additionalImages : [event.additionalImage].filter(Boolean)); setViewerIndex(0); }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="text-white w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-t-2xl" />
        )}`;

const newBannerHTML = `{event.bannerImage ? (
          <div className="flex w-full h-48 rounded-t-2xl overflow-hidden relative group">
            <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
            <button 
              onClick={() => onImageClick([event.bannerImage], 0)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="text-white w-8 h-8" />
            </button>
          </div>
        ) : (
          <div className="w-full h-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-t-2xl" />
        )}`;

content = content.replace(oldBannerHTML, newBannerHTML);

// 2. Add the Event Gallery grid at the end of the modal content (before action buttons)
const oldActions = `{/* Action Buttons */}`;
const newGalleryHTML = `{/* Event Gallery */}
          {event.additionalImages && event.additionalImages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Event Gallery</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {event.additionalImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group overflow-hidden rounded-lg cursor-pointer shadow-sm border aspect-square" onClick={() => onImageClick(event.additionalImages, idx)}>
                    <img src={imgUrl} alt={\`Gallery \${idx}\`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="text-white w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}`;

content = content.replace(oldActions, newGalleryHTML);

// 3. Inject ImageViewer into AdminDashboard render
const oldImageModal = `{/* Image Modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}`;

const newImageViewer = `{/* Image Modal (legacy fallback) */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Fullscreen ImageViewer */}
      {viewerImages && (
        <ImageViewer 
          images={viewerImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerImages(null)} 
        />
      )}`;

content = content.replace(oldImageModal, newImageViewer);

// 4. Pass onImageClick to AdminEventViewModal
const oldModalCall = `<AdminEventViewModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onApprove={(id) => { handleApprove(id); setViewingEvent(null) }}
          onReject={(id, comment) => { handleReject(id, comment); setViewingEvent(null) }}
        />`;

const newModalCall = `<AdminEventViewModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onApprove={(id) => { handleApprove(id); setViewingEvent(null) }}
          onReject={(id, comment) => { handleReject(id, comment); setViewingEvent(null) }}
          onImageClick={(images, index) => { setViewerImages(images); setViewerIndex(index); }}
        />`;

content = content.replace(oldModalCall, newModalCall);

fs.writeFileSync(filePath, content);
console.log('Fixed AdminDashboard Gallery!');
