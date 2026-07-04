const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /id: response.data.user._id,/g,
    `id: response.data.user._id,\n        _id: response.data.user._id,`
  );
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

fixFile('src/pages/LoginPage.jsx');
fixFile('src/pages/SignupPage.jsx');
