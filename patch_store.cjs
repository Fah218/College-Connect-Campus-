const fs = require('fs');
const path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `      addEvent: async (event) => {\n        const payload = {\n          ...event,\n          status: 'pending',\n          createdAt: new Date().toISOString()\n        };\n        try {\n          const response = await axios.post('http://localhost:5001/api/events/create', payload);`,
  `      addEvent: async (event) => {\n        const payload = {\n          ...event,\n          status: 'pending',\n          createdAt: new Date().toISOString()\n        };\n        const fd = new FormData();\n        fd.append('eventData', JSON.stringify(payload));\n        if (event.bannerImageFile) fd.append('bannerImage', event.bannerImageFile);\n        if (event.additionalImageFile) fd.append('additionalImages', event.additionalImageFile);\n        try {\n          const response = await axios.post('http://localhost:5001/api/events/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } });`
);

content = content.replace(
  `      updateEvent: async (id, updates) => {\n        try {\n          const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, updates);`,
  `      updateEvent: async (id, updates) => {\n        try {\n          const fd = new FormData();\n          fd.append('eventData', JSON.stringify(updates));\n          if (updates.bannerImageFile) fd.append('bannerImage', updates.bannerImageFile);\n          if (updates.additionalImageFile) fd.append('additionalImages', updates.additionalImageFile);\n          const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });`
);

if (!content.includes('deleteEvent: async')) {
  content = content.replace(
    `rejectEvent: (id, rejector, comment) => {`,
    `deleteEvent: async (id) => {\n        try {\n          await axios.delete(\`http://localhost:5001/api/events/\${id}\`);\n          set((state) => ({ events: state.events.filter(e => e.id !== id && e._id !== id) }));\n        } catch (error) {\n          console.error("Error deleting event:", error);\n        }\n      },\n\n      rejectEvent: (id, rejector, comment) => {`
  );
}

fs.writeFileSync(path, content);
console.log("Patched eventStore.js");
