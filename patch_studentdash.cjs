const fs = require('fs');
let path = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('EventCardSkeleton')) {
  content = content.replace(
    `import EventCard from '../components/EventCard'`,
    `import EventCard from '../components/EventCard'\nimport EventCardSkeleton from '../components/EventCardSkeleton'`
  );
}

content = content.replace(
  `const events = useEventStore(state => state.events)`,
  `const events = useEventStore(state => state.events)\n  const isLoading = useEventStore(state => state.isLoading)`
);

const emptyRecommended = `{recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map(event => (
                <EventCard key={event.id || event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Explore events to get personalized recommendations</p>
            </div>
          )}`;

const newEmptyRecommended = `{isLoading && events.length === 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map(event => (
                <EventCard key={event.id || event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Explore events to get personalized recommendations</p>
            </div>
          )}`;

content = content.replace(emptyRecommended, newEmptyRecommended);
fs.writeFileSync(path, content);
console.log("Patched StudentDashboard.jsx");
