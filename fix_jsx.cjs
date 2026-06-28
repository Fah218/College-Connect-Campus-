const fs = require('fs');
const file = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `) : {isIndividualHackathon ? (`,
  `) : isIndividualHackathon ? (`
);

fs.writeFileSync(file, content);
console.log("Fixed JSX syntax");
