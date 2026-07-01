const fs = require('fs');
let path = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Import Skeleton
if (!content.includes('EventCardSkeleton')) {
  content = content.replace(
    `import Navbar from '../components/Navbar'`,
    `import Navbar from '../components/Navbar'\nimport EventCardSkeleton from '../components/EventCardSkeleton'`
  );
}

// Get isLoading from store
content = content.replace(
  `const events = useEventStore(state => state.events)`,
  `const events = useEventStore(state => state.events)\n  const isLoading = useEventStore(state => state.isLoading)`
);

// If loading and no event, show skeleton
const oldNotFound = `  if (!event) return <div>Event not found</div>`;
const newNotFound = `  if (isLoading && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse bg-white rounded-2xl p-8 border">
            <div className="h-64 bg-gray-200 rounded-xl mb-8 w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-20 bg-gray-200 rounded-xl mb-4 w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  if (!event) return <div>Event not found</div>`;

content = content.replace(oldNotFound, newNotFound);

fs.writeFileSync(path, content);
console.log("Patched EventRegistrationPage.jsx");
