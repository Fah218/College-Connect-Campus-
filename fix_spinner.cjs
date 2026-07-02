const fs = require('fs');
const filePath = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure Loader2 is imported
if (!content.includes('Loader2')) {
  content = content.replace(
    `CheckCircle, Layout, List } from 'lucide-react'`,
    `CheckCircle, Layout, List, Loader2 } from 'lucide-react'`
  );
}

// Ensure the button shows a loading spinner
const oldButton = `<button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
              {event ? 'Update' : 'Create'} Event
            </button>`;

const newButton = `<button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              {isSubmitting ? 'Processing...' : (event ? 'Update Event' : 'Create Event')}
            </button>`;

if (content.includes(oldButton)) {
  content = content.replace(oldButton, newButton);
  fs.writeFileSync(filePath, content);
  console.log('Injected spinner into ClubHeadDashboard!');
} else {
  console.log('Could not find the button to replace');
}
