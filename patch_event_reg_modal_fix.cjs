const fs = require('fs');
const path = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add state
if (!content.includes('const [modalImageSrc, setModalImageSrc] = useState(null)')) {
  content = content.replace(
    `  const [loading, setLoading] = useState(false)`,
    `  const [loading, setLoading] = useState(false)\n  const [modalImageSrc, setModalImageSrc] = useState(null)`
  );
}

// Add X icon import if not present
if (!content.includes('X } from \'lucide-react\'') && !content.includes('X,') && content.includes('lucide-react')) {
  content = content.replace(
    `import { Calendar, MapPin, Users, CheckCircle, Search, PlusCircle, ShieldAlert, Trash2, Edit2 } from 'lucide-react'`,
    `import { Calendar, MapPin, Users, CheckCircle, Search, PlusCircle, ShieldAlert, Trash2, Edit2, X } from 'lucide-react'`
  );
}

fs.writeFileSync(path, content);
console.log("Patched EventRegistrationPage modal logic correctly");
