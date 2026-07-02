const fs = require('fs');
const filePath = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Pull uploadProgress from useEventStore
if (!content.includes('const { events, addEvent, updateEvent, deleteEvent, getEventSummary, uploadProgress } = useEventStore()')) {
  content = content.replace(
    `const { events, addEvent, updateEvent, deleteEvent, getEventSummary } = useEventStore()`,
    `const { events, addEvent, updateEvent, deleteEvent, getEventSummary, uploadProgress } = useEventStore()`
  );
}

// 2. Add progress bar to the modal footer
const oldFooter = `          <div className="flex gap-3 pt-4 border-t">`;
const newFooter = `          {isSubmitting && uploadProgress > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading Images...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: \`\${uploadProgress}%\` }}></div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t mt-4">`;

if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter);
}

fs.writeFileSync(filePath, content);
console.log('Added upload progress UI!');
