const fs = require('fs');
const filePath = 'src/store/eventStore.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldUpdate = `      updateEvent: async (id, updates) => {
        try {
          // If the event has a MongoDB ObjectId (string), save to backend
if (typeof id === 'string') {
            const fd = new FormData();`;

const newUpdate = `      updateEvent: async (id, updates) => {
        try {
          // Optimistic UI update immediately
          set((state) => {
            const existing = state.events.find(e => String(e.id || e._id) === String(id));
            if (!existing) return state;
            
            // Clean up files so they don't break the UI
            const optimisticEvent = { ...existing, ...updates, status: 'pending' };
            delete optimisticEvent.bannerImageFile;
            delete optimisticEvent.additionalImageFile;
            delete optimisticEvent.additionalImageFiles;

            return {
              events: state.events.map(e => String(e.id || e._id) === String(id) ? optimisticEvent : e)
            };
          });

          // If the event has a MongoDB ObjectId (string), save to backend
if (typeof id === 'string') {
            const fd = new FormData();`;

if (content.includes(oldUpdate)) {
  content = content.replace(oldUpdate, newUpdate);
  fs.writeFileSync(filePath, content);
  console.log("Injected optimistic update!");
} else {
  console.log("Could not find updateEvent block.");
}
