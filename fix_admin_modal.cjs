const fs = require('fs');
const filePath = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add modalImageSrc state if it's missing
if (!content.includes('const [modalImageSrc, setModalImageSrc]')) {
  content = content.replace(
    `const [viewerIndex, setViewerIndex] = useState(0)`,
    `const [viewerIndex, setViewerIndex] = useState(0)\n  const [modalImageSrc, setModalImageSrc] = useState(null)`
  );
}

fs.writeFileSync(filePath, content);
console.log('Fixed AdminDashboard.jsx!');
