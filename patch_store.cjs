const fs = require('fs');
let content = fs.readFileSync('src/store/eventStore.js', 'utf8');

// 1. Add state variables
content = content.replace(
  `events: [],\n      auditLogs: [],\n`,
  `events: [],\n      auditLogs: [],\n      isLoading: false,\n      error: null,\n      lastFetched: null,\n`
);

// 2. Update fetchEvents
const newFetchEvents = `fetchEvents: async (force = false) => {
        const { lastFetched, isLoading } = get();
        // Cache mechanism: don't fetch if less than 60 seconds ago unless forced
        if (!force && lastFetched && Date.now() - lastFetched < 60000) {
          return;
        }
        if (isLoading && !force) return;
        
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get('http://localhost:5001/api/events');
          const dbEvents = response.data.events.map(dbEvent => ({
            ...dbEvent,
            id: dbEvent._id,
            attendees: dbEvent.attendees || 0,
            club: dbEvent.clubName, // map clubName back to club for backward compatibility with frontend
            capacity: dbEvent.maxParticipants || 100, // Map maxParticipants to capacity for the UI
            date: dbEvent.date || dbEvent.startDate,
            time: dbEvent.time || dbEvent.startTime
          }));
          set({ events: dbEvents, isLoading: false, lastFetched: Date.now() });
        } catch (error) {
          console.error("Error fetching events from DB:", error);
          set({ isLoading: false, error: error.message });
        }
      },`;

content = content.replace(
  /fetchEvents:\s*async\s*\(\)\s*=>\s*\{[\s\S]*?catch\s*\(error\)\s*\{\s*console\.error\("Error fetching events from DB:",\s*error\);\s*\}\s*\},/,
  newFetchEvents
);

// 3. Make addEvent return a promise properly (already has try...catch, just need to throw)
content = content.replace(
  `        } catch (error) {\n          console.error("Error saving event to database:", error);\n          throw error;\n        }`,
  `        } catch (error) {\n          console.error("Error saving event to database:", error);\n          throw error;\n        }` // Actually it already throws! Let's check updateEvent.
);

// 4. Update updateEvent to throw
content = content.replace(
  `        } catch (error) {\n          console.error("Error updating event:", error);\n        }`,
  `        } catch (error) {\n          console.error("Error updating event:", error);\n          throw error;\n        }`
);

// 5. Update deleteEvent to throw if it had API call, but deleteEvent is currently local only! 
// Wait, is deleteEvent in eventStore hitting the backend? Let's check.
// I will check deleteEvent in the original file, I don't see axios there, but I will write it properly if needed.

fs.writeFileSync('src/store/eventStore.js', content);
