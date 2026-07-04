const fs = require('fs');

function replaceAll(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  fs.writeFileSync(file, content);
  console.log("Updated", file);
}

// 1. HackathonTeammateFinder.jsx
replaceAll('src/pages/HackathonTeammateFinder.jsx', [
  { regex: /form\.teamName/g, replace: 'form.title' },
  { regex: /teamName:\s*initialData\?.+/g, replace: "title: initialData?.title || ''," },
  { regex: /req\.teamName\s*\|\|\s*req\.title\s*\|\|\s*'[^']+'/g, replace: 'req.title' },
  { regex: /req\.teamName\s*\|\|\s*req\.title/g, replace: 'req.title' },
  { regex: /myTeam\.teamName\s*\|\|\s*'[^']+'/g, replace: 'myTeam.title' },
  { regex: /setForm\(\{\s*\.\.\.form,\s*teamName:/g, replace: 'setForm({ ...form, title:' },
  { regex: /value=\{form\.teamName\}/g, replace: 'value={form.title}' },
  { regex: /teamName/g, replace: 'title' } // fallback for anything missed like myTeam.teamName -> myTeam.title
]);

// 2. ParticipantsModal.jsx
replaceAll('src/components/ParticipantsModal.jsx', [
  { regex: /reg\.teamDetails\?.teamName\s*\|\|\s*reg\.teamDetails\?.title\s*\|\|\s*'[^']+'/g, replace: 'reg.teamDetails?.title' },
  { regex: /reg\.teamId\?.title\s*\|\|\s*reg\.teamId\?.teamName\s*\|\|\s*'[^']+'/g, replace: 'reg.teamId?.title' },
  { regex: /reg\.teamDetails\?.teamName\s*\|\|\s*reg\.teamId\?.title\s*\|\|\s*reg\.teamId\?.teamName\s*\|\|\s*'[^']+'/g, replace: 'reg.teamDetails?.title || reg.teamId?.title' },
  { regex: /selectedTeam\.teamDetails\?.teamName\s*\|\|\s*selectedTeam\.teamId\?.title\s*\|\|\s*selectedTeam\.teamId\?.teamName\s*\|\|\s*'[^']+'/g, replace: 'selectedTeam.teamDetails?.title || selectedTeam.teamId?.title' },
  { regex: /teamName/g, replace: 'title' }
]);

// 3. EventRegistrationPage.jsx
replaceAll('src/pages/EventRegistrationPage.jsx', [
  { regex: /myTeam\.title\s*\|\|\s*myTeam\.teamName/g, replace: 'myTeam.title' },
  { regex: /teamName:\s*offlineTeamData\.title\.trim\(\),/g, replace: 'title: offlineTeamData.title.trim(),' }
]);

// 4. hackathonStore.js
replaceAll('src/store/hackathonStore.js', [
  { regex: /teamName:\s*tr\.title\s*\|\|\s*tr\.teamName\s*\|\|\s*'[^']+',/g, replace: '' },
  { regex: /title:\s*data\.title\s*\|\|\s*data\.teamName\s*\|\|\s*'[^']+',/g, replace: 'title: data.title,' },
  { regex: /teamName:\s*dbReq\.title\s*\|\|\s*dbReq\.teamName\s*\|\|\s*dbReq\.name\s*\|\|\s*'[^']+',/g, replace: '' },
  { regex: /title:\s*dbReq\.title\s*\|\|\s*dbReq\.teamName\s*\|\|\s*dbReq\.name\s*\|\|\s*'[^']+',/g, replace: 'title: dbReq.title,' },
  { regex: /teamName:\s*updatedTr\.title\s*\|\|\s*updatedTr\.teamName\s*\|\|\s*updatedTr\.name\s*\|\|\s*'[^']+',/g, replace: '' },
  { regex: /title:\s*updatedTr\.title\s*\|\|\s*updatedTr\.teamName\s*\|\|\s*updatedTr\.name\s*\|\|\s*'[^']+',/g, replace: 'title: updatedTr.title,' },
  { regex: /teamReq\.teamName\s*\|\|\s*teamReq\.title\s*\|\|\s*'[^']+'/g, replace: 'teamReq.title' },
  { regex: /teamReq\?\.title\s*\|\|\s*teamReq\?\.teamName\s*\|\|\s*'[^']+'/g, replace: 'teamReq?.title' },
  { regex: /teamReq\.teamName/g, replace: 'teamReq.title' },
  { regex: /req\.teamName/g, replace: 'req.title' }
]);

