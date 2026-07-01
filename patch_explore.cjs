const fs = require('fs');
let path = 'src/pages/ExploreEventsPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('EventCardSkeleton')) {
  content = content.replace(
    `import EventCard from '../components/EventCard'`,
    `import EventCard from '../components/EventCard'\nimport EventCardSkeleton from '../components/EventCardSkeleton'`
  );
}

// Get isLoading from store
content = content.replace(
  `const events = useEventStore(state => state.events)`,
  `const events = useEventStore(state => state.events)\n  const isLoading = useEventStore(state => state.isLoading)`
);

// Replace "No events found" with skeleton when loading
const emptyStateCode = `{filtered.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-gray-500">No events found matching your criteria.</h3>
          </div>
        ) : (`;

const newEmptyStateCode = `{isLoading && events.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-gray-500">No events found matching your criteria.</h3>
          </div>
        ) : (`;

content = content.replace(emptyStateCode, newEmptyStateCode);
fs.writeFileSync(path, content);
console.log("Patched ExploreEventsPage.jsx");
