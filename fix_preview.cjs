const fs = require('fs');
const path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `      setFormData({ ...formData, [field + 'File']: file });`,
  `      setFormData({ ...formData, [field + 'File']: file, [field]: URL.createObjectURL(file) });`
);

fs.writeFileSync(path, content);
console.log("Fixed preview");
