const fs = require('fs');
const path = 'src/pages/StudentProfilePage.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("const participationCounts = {}\n  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']", "const participationCounts = {}");

fs.writeFileSync(path, content);
console.log('Fixed StudentProfilePage.jsx');
