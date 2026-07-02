const fs = require('fs');
const filePath = 'src/pages/HackathonDetails.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add ImageViewer import if missing
if (!content.includes('import ImageViewer')) {
  content = content.replace(
    `import Navbar from '../components/Navbar'`,
    `import Navbar from '../components/Navbar'\nimport ImageViewer from '../components/ImageViewer'`
  );
}

// 2. Add state for viewerImages and viewerIndex
if (!content.includes('const [viewerImages, setViewerImages] = useState(null)')) {
  content = content.replace(
    `const [modalImageSrc, setModalImageSrc] = useState(null)`,
    `const [modalImageSrc, setModalImageSrc] = useState(null)\n  const [viewerImages, setViewerImages] = useState(null)\n  const [viewerIndex, setViewerIndex] = useState(0)`
  );
}

// 3. Update the click handlers to use viewerImages
content = content.replace(
  `onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalImageSrc(h.bannerImage); }}`,
  `onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewerImages([h.bannerImage]); setViewerIndex(0); }}`
);

content = content.replace(
  `onClick={() => setModalImageSrc(imgUrl)}`,
  `onClick={() => { setViewerImages(h.additionalImages); setViewerIndex(idx); }}`
);

// 4. Update the modal render at the end
const oldModal = `{/* Image Modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}`;

const newModal = `{/* Image Modal (legacy) */}
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

content = content.replace(oldModal, newModal);

fs.writeFileSync(filePath, content);
console.log('Fixed HackathonDetails Gallery!');
