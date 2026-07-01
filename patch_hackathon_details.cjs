const fs = require('fs');
let path = 'src/pages/HackathonDetails.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('isLoading')) {
  content = content.replace(
    `const hackathons = useEventStore(state => state.events.filter(e => e.category === 'Hackathon'))`,
    `const hackathons = useEventStore(state => state.events.filter(e => e.category === 'Hackathon'))\n  const isLoading = useEventStore(state => state.isLoading)`
  );
}

const oldNotFound = `  if (!h) return <div>Hackathon not found</div>`;
const newNotFound = `  if (isLoading && !h) {
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
  if (!h) return <div>Hackathon not found</div>`;

content = content.replace(oldNotFound, newNotFound);

fs.writeFileSync(path, content);
console.log("Patched HackathonDetails.jsx");
