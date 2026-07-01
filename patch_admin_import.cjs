const fs = require('fs');
let path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('ImageViewer')) {
  content = content.replace(
    `import Navbar from '../components/Navbar'`,
    `import Navbar from '../components/Navbar'\nimport ImageViewer from '../components/ImageViewer'`
  );
}

fs.writeFileSync(path, content);
console.log("Patched AdminDashboard.jsx import");
