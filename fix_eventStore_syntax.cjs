const fs = require('fs');
let path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

// The broken code starts around line 103:
// const response = await axios.put(...)
// set((state) => ({
// events: ... response.data.event ...

// We need to fix the block structure.

content = content.replace(
  /const response = await axios\.put\(`http:\/\/localhost:5001\/api\/events\/\$\{id\}`,\s*fd,\s*{\s*\/\/ axios automatically sets multipart boundary\s*}\);\s*set\(\(state\) => \(\{\s*events: state\.events\.map\(e => String\(e\.id \|\| e\._id\) === String\(id\) \? { \.\.\.e, \.\.\.response\.data\.event, status: 'pending' } : e\),/s,
  `const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
              // axios automatically sets multipart boundary
            });
            
            set((state) => ({
              events: state.events.map(e => String(e.id || e._id) === String(id) ? { ...e, ...response.data.event, status: 'pending' } : e),
              auditLogs: [...state.auditLogs, {
                id: Date.now(),
                action: 'updated',
                eventId: id,
                eventTitle: state.events.find(ev => String(ev.id || ev._id) === String(id))?.title,
                timestamp: new Date().toISOString(),
                user: 'Club Head'
              }]
            }));
          } else {
            // Local fallback
            set((state) => ({
              events: state.events.map(e => e.id === id ? { ...e, ...updates, status: 'pending' } : e),`
);

// We should also replace the stray closing braces below it.
content = content.replace(
  /auditLogs: \[\.\.\.state\.auditLogs, \{\s*id: Date\.now\(\),\s*action: 'updated',\s*eventId: id,\s*eventTitle: state\.events\.find\(e => e\.id === id\)\?\.title,\s*timestamp: new Date\(\)\.toISOString\(\),\s*user: 'Club Head'\s*\}\]\s*\}\)\);\s*\}/,
  `auditLogs: [...state.auditLogs, {
              id: Date.now(),
              action: 'updated',
              eventId: id,
              eventTitle: state.events.find(e => e.id === id)?.title,
              timestamp: new Date().toISOString(),
              user: 'Club Head'
            }]
          }));
          }`
);


fs.writeFileSync(path, content);
console.log("Applied syntax fix for eventStore.js");
