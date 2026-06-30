const fs = require('fs');
const path = 'backend/server.js';
let content = fs.readFileSync(path, 'utf8');

// import path and fileURLToPath if not imported
if (!content.includes('import path from')) {
  content = content.replace(
    'import express from \'express\';',
    `import express from 'express';\nimport path from 'path';\nimport { fileURLToPath } from 'url';`
  );
}

if (!content.includes('const __dirname = path.dirname')) {
  content = content.replace(
    'const app = express();',
    `const __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n\nconst app = express();\n\n// Serve static uploads\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));`
  );
}

fs.writeFileSync(path, content);
console.log("Patched server.js");
