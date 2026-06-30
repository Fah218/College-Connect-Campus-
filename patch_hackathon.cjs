const fs = require('fs');

// Patch HackathonPage.jsx
const hPath = 'src/pages/HackathonPage.jsx';
let hContent = fs.readFileSync(hPath, 'utf8');

if (!hContent.includes('additionalImage: e.additionalImage')) {
  hContent = hContent.replace(
    'bannerImage: e.bannerImage,',
    'bannerImage: e.bannerImage,\n        additionalImage: e.additionalImage,'
  );
  
  if (!hContent.includes('const [modalImageSrc, setModalImageSrc] = useState(null)')) {
    hContent = hContent.replace(
      'const [search, setSearch] = useState(\'\')',
      'const [search, setSearch] = useState(\'\')\n  const [modalImageSrc, setModalImageSrc] = useState(null)'
    );
  }

  // Update card image rendering in HackathonPage
  hContent = hContent.replace(
    `        {h.bannerImage ? (\n          <img src={h.bannerImage} alt={h.title} className="w-full h-36 object-cover" />\n        ) : (`,
    `        {h.bannerImage || h.additionalImage ? (\n          <div className="flex w-full h-36">\n            {h.bannerImage && (\n              <div className="relative group flex-1 h-full">\n                <img src={h.bannerImage} alt={h.title} className="w-full h-full object-cover" />\n                <button \n                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalImageSrc(h.bannerImage); }}\n                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n                >\n                  <Maximize2 className="text-white w-6 h-6" />\n                </button>\n              </div>\n            )}\n            {h.additionalImage && (\n              <div className="relative group w-1/3 border-l border-white h-full bg-gray-100">\n                <img src={h.additionalImage} alt="Additional" className="w-full h-full object-cover" />\n                <button \n                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalImageSrc(h.additionalImage); }}\n                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n                >\n                  <Maximize2 className="text-white w-6 h-6" />\n                </button>\n              </div>\n            )}\n          </div>\n        ) : (`
  );

  // Add the modal to the very end of HackathonPage.jsx return
  hContent = hContent.replace(
    `    </div>\n  )\n}`,
    `      {/* Image Modal */}\n      {modalImageSrc && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>\n          <button className="absolute top-4 right-4 text-white hover:text-gray-300">\n            <X size={32} />\n          </button>\n          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />\n        </div>\n      )}\n    </div>\n  )\n}`
  );
  
  // ensure Maximize2 and X are imported in HackathonPage
  hContent = hContent.replace(
    `import { Search, Filter, Calendar, MapPin, Users, ChevronRight } from 'lucide-react'`,
    `import { Search, Filter, Calendar, MapPin, Users, ChevronRight, Maximize2, X } from 'lucide-react'`
  );
  
  fs.writeFileSync(hPath, hContent);
  console.log("Patched HackathonPage.jsx");
}

// Patch HackathonDetails.jsx
const hdPath = 'src/pages/HackathonDetails.jsx';
let hdContent = fs.readFileSync(hdPath, 'utf8');

if (!hdContent.includes('additionalImage: raw.additionalImage')) {
  hdContent = hdContent.replace(
    'bannerImage: raw.bannerImage,',
    'bannerImage: raw.bannerImage,\n    additionalImage: raw.additionalImage,'
  );

  if (!hdContent.includes('const [modalImageSrc, setModalImageSrc] = useState(null)')) {
    hdContent = hdContent.replace(
      'const [showRegModal, setShowRegModal] = useState(false)',
      'const [showRegModal, setShowRegModal] = useState(false)\n  const [modalImageSrc, setModalImageSrc] = useState(null)'
    );
  }

  hdContent = hdContent.replace(
    `        <div className="h-48 md:h-64 bg-gray-200 relative">\n          {h.bannerImage ? (\n            <img src={h.bannerImage} className="w-full h-full object-cover" alt={h.title} />\n          ) : (\n            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-purple-700"></div>\n          )}\n        </div>`,
    `        <div className="h-48 md:h-64 bg-gray-200 relative flex">\n          {h.bannerImage ? (\n            <div className="relative group flex-1 h-full">\n              <img src={h.bannerImage} className="w-full h-full object-cover" alt={h.title} />\n              <button \n                onClick={() => setModalImageSrc(h.bannerImage)}\n                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n              >\n                <Maximize2 className="text-white w-8 h-8" />\n              </button>\n            </div>\n          ) : (\n            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-purple-700"></div>\n          )}\n          {h.additionalImage && (\n            <div className="relative group w-1/3 md:w-1/4 h-full border-l-2 border-white">\n              <img src={h.additionalImage} className="w-full h-full object-cover" alt="Additional" />\n              <button \n                onClick={() => setModalImageSrc(h.additionalImage)}\n                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"\n              >\n                <Maximize2 className="text-white w-6 h-6" />\n              </button>\n            </div>\n          )}\n        </div>`
  );

  hdContent = hdContent.replace(
    `    </div>\n  )\n}`,
    `      {/* Image Modal */}\n      {modalImageSrc && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>\n          <button className="absolute top-4 right-4 text-white hover:text-gray-300">\n            <X size={32} />\n          </button>\n          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />\n        </div>\n      )}\n    </div>\n  )\n}`
  );
  
  hdContent = hdContent.replace(
    `import { Calendar, MapPin, Users, Clock, ExternalLink, Shield, Trophy, ChevronRight } from 'lucide-react'`,
    `import { Calendar, MapPin, Users, Clock, ExternalLink, Shield, Trophy, ChevronRight, Maximize2, X } from 'lucide-react'`
  );
  
  fs.writeFileSync(hdPath, hdContent);
  console.log("Patched HackathonDetails.jsx");
}

