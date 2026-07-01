const fs = require('fs');
let path = 'src/store/eventStore.js';
let content = fs.readFileSync(path, 'utf8');

// Undo the sed change completely
content = content.replace(/} } catch \(error\) {/g, '} catch (error) {');

// The only place that actually needed an extra brace was the `updateEvent` try block!
// The structure in `updateEvent` is:
/*
      updateEvent: async (id, updates) => {
        try {
          if (typeof id === 'string') {
             ...
            set((state) => ({ ... }));
          } else {
            // Local fallback
            set((state) => ({ ... }));
          } catch (error) {
*/
// The 'else' block doesn't have a closing brace.
content = content.replace(
  `} catch (error) {\n          console.error("Error updating event:", error);`,
  `}\n        } catch (error) {\n          console.error("Error updating event:", error);`
);

fs.writeFileSync(path, content);
console.log("Fixed brackets in eventStore.js");
