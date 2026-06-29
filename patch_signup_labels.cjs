const fs = require('fs');
const path = 'src/pages/SignupPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Required fields: Add red asterisk
content = content.replace(
  'Full Name *',
  'Full Name <span className="text-red-500">*</span>'
);

content = content.replace(
  'Email *',
  'Email <span className="text-red-500">*</span>'
);

content = content.replace(
  'Password *',
  'Password <span className="text-red-500">*</span>'
);

content = content.replace(
  'Confirm Password *',
  'Confirm Password <span className="text-red-500">*</span>'
);

content = content.replace(
  'Club Access Code *',
  'Club Access Code <span className="text-red-500">*</span>'
);

// Optional fields that didn't have (optional): Add (optional)
content = content.replace(
  'Department\n',
  'Department (optional)\n'
);

content = content.replace(
  'Year\n',
  'Year (optional)\n'
);

content = content.replace(
  'Skills (comma-separated)',
  'Skills (optional)'
);

content = content.replace(
  'Interests (comma-separated)',
  'Interests (optional)'
);

content = content.replace(
  'Club Description\n',
  'Club Description (optional)\n'
);

fs.writeFileSync(path, content);
console.log("Labels patched successfully");
