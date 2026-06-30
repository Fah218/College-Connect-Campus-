const fs = require('fs');
const path = 'src/components/EventCard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Import Maximize2 and X
content = content.replace(
  `import { Calendar, MapPin, Users, Tag, Bell, BellOff } from 'lucide-react'`,
  `import { Calendar, MapPin, Users, Tag, Bell, BellOff, Maximize2, X, Image as ImageIcon } from 'lucide-react'`
);

// Add state for modal
content = content.replace(
  `  const [toast, setToast] = useState(null)`,
  `  const [toast, setToast] = useState(null)\n  const [showImageModal, setShowImageModal] = useState(false)\n  const [modalImageSrc, setModalImageSrc] = useState('')`
);

// Add function to open modal
content = content.replace(
  `  const handleReminder = () => {`,
  `  const openImage = (src) => {\n    setModalImageSrc(src);\n    setShowImageModal(true);\n  }\n\n  const handleReminder = () => {`
);

// Add image banner to the top of the card, before Header
content = content.replace(
  `      {/* Header */}`,
  `      {/* Images */}\n      {(event.bannerImage || event.additionalImage) && (\n        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">\n          {event.bannerImage && (\n            <div className="relative group shrink-0 w-full h-36 rounded-lg overflow-hidden bg-gray-100">\n              <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />\n              <button \n                onClick={() => openImage(event.bannerImage)}\n                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n              >\n                <Maximize2 className="text-white w-6 h-6" />\n              </button>\n            </div>\n          )}\n          {event.additionalImage && (\n            <div className="relative group shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-gray-100">\n              <img src={event.additionalImage} alt="Additional" className="w-full h-full object-cover" />\n              <button \n                onClick={() => openImage(event.additionalImage)}\n                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n              >\n                <Maximize2 className="text-white w-5 h-5" />\n              </button>\n            </div>\n          )}\n        </div>\n      )}\n\n      {/* Header */}`
);

// Add modal at the end of the return statement, just before the closing </div>
content = content.replace(
  `    </div>\n  )\n}`,
  `      {/* Image Modal */}\n      {showImageModal && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowImageModal(false)}>\n          <button className="absolute top-4 right-4 text-white hover:text-gray-300">\n            <X size={32} />\n          </button>\n          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />\n        </div>\n      )}\n    </div>\n  )\n}`
);


fs.writeFileSync(path, content);
console.log("Patched EventCard.jsx");
