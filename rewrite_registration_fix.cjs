const fs = require('fs');

let path = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// I need to strip from the first occurrence of:
// `const hackathonLayout = (`
// down to the very end of the file, and replace it with a clean version.

// Wait, the file is currently corrupted from line 377 downwards. Let's just git restore again and rewrite correctly.
