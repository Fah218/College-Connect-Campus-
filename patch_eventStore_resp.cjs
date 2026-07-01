const fs = require('fs');
let path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `
            await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
              // axios automatically sets multipart boundary
            });
          }
          
          set((state) => ({
            events: state.events.map(e => e.id === id ? { ...e, ...updates, status: 'pending' } : e),
`;

const newCode = `
            const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
              // axios automatically sets multipart boundary
            });
            
            set((state) => ({
              events: state.events.map(e => String(e.id || e._id) === String(id) ? { ...e, ...response.data.event, status: 'pending' } : e),
`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(path, content);
console.log("Patched eventStore response handling");
