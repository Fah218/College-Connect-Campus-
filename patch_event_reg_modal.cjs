const fs = require('fs');
const path = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add state
if (!content.includes('const [modalImageSrc, setModalImageSrc]')) {
  content = content.replace(
    `  const [loading, setLoading] = useState(false);`,
    `  const [loading, setLoading] = useState(false);\n  const [modalImageSrc, setModalImageSrc] = useState(null);`
  );
}

// Add X icon import if not present (from lucide-react)
if (!content.includes('X,') && content.includes('lucide-react')) {
  content = content.replace(
    `import { Calendar, MapPin, Users, Info, ShieldAlert, ArrowLeft, Search, PlusCircle, CheckCircle } from 'lucide-react'`,
    `import { Calendar, MapPin, Users, Info, ShieldAlert, ArrowLeft, Search, PlusCircle, CheckCircle, X } from 'lucide-react'`
  );
}

// Add Modal JSX at the bottom before final closing div
const modalCode = `
      {/* Image Modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
`;

content = content.replace(
  `    </div>\n  )\n}\n`,
  modalCode + `\n    </div>\n  )\n}\n`
);

fs.writeFileSync(path, content);
console.log("Patched EventRegistrationPage modal");
