const fs = require('fs');
const filePath = 'src/store/authStore.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `login: (userData) => set({ user: userData, isAuthenticated: true }),`,
  `login: (userData) => {
        // Ensure _id exists to satisfy new strict ObjectId requirement
        if (userData && userData.id && !userData._id) {
          userData._id = userData.id;
        }
        return set({ user: userData, isAuthenticated: true });
      },`
);

fs.writeFileSync(filePath, content);
console.log("Updated authStore.js to alias _id.");
