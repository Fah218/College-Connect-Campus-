const fs = require('fs');

const path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('additionalImage: event.additionalImage')) {
  // Ensure the modal state exists
  if (!content.includes('const [modalImageSrc, setModalImageSrc] = useState(null)')) {
    content = content.replace(
      'const [isArchiving, setIsArchiving] = useState(false)',
      'const [isArchiving, setIsArchiving] = useState(false)\n  const [modalImageSrc, setModalImageSrc] = useState(null)'
    );
  }

  // Pending Approvals Card (line 206)
  content = content.replace(
    `            {event.bannerImage && (\n              <img src={event.bannerImage} alt={event.title} className="w-full h-28 object-cover rounded-lg mb-4" />\n            )}`,
    `            {(event.bannerImage || event.additionalImage) && (\n              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">\n                {event.bannerImage && (\n                  <div className="relative group shrink-0 w-full h-28 rounded-lg overflow-hidden bg-gray-100">\n                    <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />\n                    <button \n                      onClick={(e) => { e.stopPropagation(); setModalImageSrc(event.bannerImage); }}\n                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n                    >\n                      <Maximize2 className="text-white w-6 h-6" />\n                    </button>\n                  </div>\n                )}\n                {event.additionalImage && (\n                  <div className="relative group shrink-0 w-24 h-28 rounded-lg overflow-hidden bg-gray-100">\n                    <img src={event.additionalImage} alt="Additional" className="w-full h-full object-cover" />\n                    <button \n                      onClick={(e) => { e.stopPropagation(); setModalImageSrc(event.additionalImage); }}\n                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n                    >\n                      <Maximize2 className="text-white w-5 h-5" />\n                    </button>\n                  </div>\n                )}\n              </div>\n            )}`
  );

  // Modal Details (line 298)
  content = content.replace(
    `        {event.bannerImage ? (\n          <img src={event.bannerImage} alt={event.title} className="w-full h-48 object-cover rounded-t-2xl" />\n        ) : (`,
    `        {event.bannerImage || event.additionalImage ? (\n          <div className="flex w-full h-48 rounded-t-2xl overflow-hidden">\n            {event.bannerImage && (\n              <div className="relative group flex-1 h-full">\n                <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />\n                <button \n                  onClick={() => setModalImageSrc(event.bannerImage)}\n                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n                >\n                  <Maximize2 className="text-white w-8 h-8" />\n                </button>\n              </div>\n            )}\n            {event.additionalImage && (\n              <div className="relative group w-1/3 border-l-2 border-white h-full bg-gray-100">\n                <img src={event.additionalImage} alt="Additional" className="w-full h-full object-cover" />\n                <button \n                  onClick={() => setModalImageSrc(event.additionalImage)}\n                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n                >\n                  <Maximize2 className="text-white w-6 h-6" />\n                </button>\n              </div>\n            )}\n          </div>\n        ) : (`
  );

  content = content.replace(
    `    </div>\n  )\n}`,
    `      {/* Image Modal */}\n      {modalImageSrc && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>\n          <button className="absolute top-4 right-4 text-white hover:text-gray-300">\n            <X size={32} />\n          </button>\n          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />\n        </div>\n      )}\n    </div>\n  )\n}`
  );
  
  content = content.replace(
    `import { Users, Calendar, Settings, Shield, Plus, Archive, ChevronRight, CheckCircle, XCircle } from 'lucide-react'`,
    `import { Users, Calendar, Settings, Shield, Plus, Archive, ChevronRight, CheckCircle, XCircle, Maximize2, X } from 'lucide-react'`
  );
  
  fs.writeFileSync(path, content);
  console.log("Patched AdminDashboard.jsx");
}

