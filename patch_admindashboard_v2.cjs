const fs = require('fs');
const path = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove local generateInsights definition and insights call
content = content.replace(/const generateInsights = \(events\) => \{[\s\S]*?\};\n\n  const insights = generateInsights\(events\)/, "");
// Remove the leftover fetchAdminAnalytics from the first patch
content = content.replace("const { adminAnalytics, fetchAdminAnalytics } = useAnalyticsStore()", "const { adminAnalytics } = useAnalyticsStore()");

// Replace Insights mapping to use adminAnalytics
content = content.replace("{insights.map(insight => (", "{(adminAnalytics?.dashboard?.insights || []).map(insight => (");

// Remove mock clubData and chartData logic
content = content.replace(/const clubData = events\.reduce\([\s\S]*?\}\)/, "");
content = content.replace(/const chartData = Object\.entries\(clubData\)[\s\S]*?\}\)\)/, "");
content = content.replace(/const monthlyData = \[[\s\S]*?\]/, "");

// Map chartData and monthlyData in AnalyticsSection component
content = content.replace("chartData={chartData} monthlyData={monthlyData}", "chartData={adminAnalytics?.dashboard?.chartData || []} monthlyData={adminAnalytics?.dashboard?.monthlyData || []}");

// Also pass clubs data to ClubSection 
content = content.replace("clubHeads={clubHeads} onManage={setManagingClub} realClubs={realClubs} toggleArchiveStatus={toggleArchiveStatus}", "clubs={adminAnalytics?.dashboard?.clubs || []} clubHeads={clubHeads} onManage={setManagingClub} realClubs={realClubs} toggleArchiveStatus={toggleArchiveStatus}");

// Rewrite ClubSection to ONLY use the clubs array from the backend
const newClubSection = `function ClubSection({ clubs, clubHeads, onManage, toggleArchiveStatus }) {
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
              displayedClubs.map(club => (
                <tr key={club.id}>
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
}`;
content = content.replace(/function ClubSection\([\s\S]*?\}\s*\)\s*\}/, newClubSection);

// Update registered teams stat
content = content.replace("value={adminStats.teamRegs}", "value={adminAnalytics?.dashboard?.registeredTeams || 0}");

fs.writeFileSync(path, content);
console.log('Successfully updated AdminDashboard.jsx');
