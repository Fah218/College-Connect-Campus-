const fs = require('fs');
const filePath = 'src/store/eventStore.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldPayload = `      addEvent: async (event) => {
        const payload = {
          ...event,
          clubName: event.club || 'Tech Club',
          date: event.date || event.startDate || new Date().toISOString().split('T')[0],
          time: event.time || event.startTime || '12:00',`;

const newPayload = `      addEvent: async (event) => {
        const payload = {
          ...event,
          clubName: event.club || 'Tech Club',
          startDate: event.startDate || event.date || new Date().toISOString().split('T')[0],
          startTime: event.startTime || event.time || '12:00',`;

if (content.includes(oldPayload)) {
  content = content.replace(oldPayload, newPayload);
  fs.writeFileSync(filePath, content);
  console.log("Fixed payload startDate mapping!");
} else {
  console.log("Could not find payload mapping in addEvent.");
}
