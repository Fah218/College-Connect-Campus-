const fs = require('fs');
const path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('function ClubSection');
if (startIdx === -1) {
  console.log('Could not find ClubSection');
  process.exit(1);
}

// ClubSection is the last function in the file, or is followed by another component?
// Let's check if there's any function after it.
// AdminEventViewModal, AnalyticsSection, AuditSection are defined BEFORE ClubSection.
// So ClubSection should be the last thing in the file.
const endIdx = content.length; // Actually we can just slice to the end.

const newClubSection = `function ClubSection({ clubs, onManage }) {
  const [showArchived, setShowArchived] = useState(false);
  
  const displayedClubs = showArchived ? clubs.filter(c => c.isArchived) : clubs.filter(c => !c.isArchived);

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-gray-500 font-medium">No clubs found.</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={\`px-4 py-2 text-sm font-semibold rounded-lg transition \${showArchived ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}\`}
        >
          {showArchived ? 'Show Active Clubs' : 'Show Archived Clubs'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Head</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayedClubs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {showArchived ? 'No archived clubs found.' : 'No active clubs found.'}
                </td>
              </tr>
            ) : (
              displayedClubs.map((club, idx) => (
                <tr key={club.id || idx}>
              <td className="px-6 py-4 font-medium">{club.name}</td>
              <td className="px-6 py-4">{club.head}</td>
              <td className="px-6 py-4">{club.members}</td>
              <td className="px-6 py-4">{club.events}</td>
              <td className="px-6 py-4">
                <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${
                  club.status === 'Active' ? 'bg-green-100 text-green-700' : 
                  club.status === 'Inactive' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }\`}>
                  {club.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onManage(club)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Manage
                </button>
              </td>
            </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
`;

const preContent = content.substring(0, startIdx);
fs.writeFileSync(path, preContent + newClubSection);
console.log('Successfully updated AdminDashboard.jsx ClubSection');
