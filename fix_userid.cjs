const fs = require('fs');

const files = [
  'src/components/Navbar.jsx',
  'src/components/ProfileEditForm.jsx',
  'src/pages/HackathonTeammateFinder.jsx',
  'src/pages/EventRegistrationPage.jsx',
  'src/pages/StudentDashboard.jsx'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace `user.id || user._id` to `user._id`
  content = content.replace(/user\.id\s*\|\|\s*user\._id/g, 'user._id');
  
  // Replace remaining `user.id` to `user._id` safely
  content = content.replace(/user\?\.id/g, 'user?._id');
  content = content.replace(/user\.id/g, 'user._id');
  
  // Clean up any user._id || user._id
  content = content.replace(/user\._id\s*\|\|\s*user\._id/g, 'user._id');
  content = content.replace(/user\?._id\s*\|\|\s*user\?._id/g, 'user?._id');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
});
