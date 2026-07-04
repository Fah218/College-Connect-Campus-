const fs = require('fs');

function replaceTeamDetails(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\} else if \(r\.teamDetails\) \{\s*return \(r\.teamDetails\.members \|\| \[\]\)\.some\(m => m\.email\?\.toLowerCase\(\) === user\?\.email\?\.toLowerCase\(\)\);\s*\}/,
    `} else if (r.teamId) {
        return [...(r.teamId.currentMembers || []), ...(r.teamId.offlineMembers || [])]
          .some(m => m.email?.toLowerCase() === user?.email?.toLowerCase());
      }`
  );
  fs.writeFileSync(file, content);
}

replaceTeamDetails('src/pages/EventRegistrationPage.jsx');
replaceTeamDetails('src/pages/StudentDashboard.jsx');
console.log('Fixed EventRegistrationPage.jsx and StudentDashboard.jsx');
