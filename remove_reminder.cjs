const fs = require('fs');
const filePath = 'src/pages/HackathonDetails.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Reminder button code
const reminderButtonStr = `                <button 
                  onClick={() => addNotification({ title: 'Reminder Set', message: 'You will be notified before the deadline.', priority: 'low' })}
                  className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Bell size={16} /> Set Reminder
                </button>`;

content = content.replace(reminderButtonStr, '');

// Also remove Bell from imports if we can easily find it
content = content.replace(', Bell', '');

fs.writeFileSync(filePath, content);
console.log('Update applied successfully!');
