const fs = require('fs');
const path = 'src/pages/ClubHeadProfilePage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Use stats from analytics
content = content.replace("const { events } = useEventStore()", "");
content = content.replace(/const myEvents = events\.filter\([\s\S]*?\}\)/, "const myEvents = clubHeadAnalytics?.profile?.eventHistory || []");
content = content.replace("const pendingEvents = myEvents.filter(e => e.status === 'pending')", "const pendingEvents = myEvents.filter(e => e.status === 'pending')");
content = content.replace("const approvedEvents = myEvents.filter(e => e.status === 'approved')", "const approvedEvents = myEvents.filter(e => e.status === 'approved')");
content = content.replace("const rejectedEvents = myEvents.filter(e => e.status === 'rejected')", "const rejectedEvents = myEvents.filter(e => e.status === 'rejected')");

// Replace hardcoded Highlights
const highlightsRegex = /<div className="grid md:grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* 👥 Participation Insights \*\/\}/;
const newHighlights = `<div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy size={28} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">Top Performing Event</p>
                  <p className="text-xl font-bold text-gray-900">{clubHeadAnalytics?.profile?.topPerformingEvent?.title || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Most Registrations</p>
                  <p className="text-xl font-bold text-gray-900">{clubHeadAnalytics?.profile?.mostRegistrations || 0} Students Registered</p>
                </div>
              </div>
            </div>
            
            {/* 👥 Participation Insights */}`;

content = content.replace(highlightsRegex, newHighlights);

// Calculate dynamic participationData instead of hardcoded
const dynParticipationStr = `const participationData = myEvents.filter(e => e.status === 'approved').slice(0, 5).map(e => ({
    event: e.title?.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
    participants: e.totalParticipants || e.attendees || 0
  }));`;

content = content.replace(/const participationData = \[[\s\S]*?\]/, dynParticipationStr);

// Change static 85% attendance rate
content = content.replace('<span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">85% Avg. Attendance Rate</span>', '');

fs.writeFileSync(path, content);
console.log('Successfully updated ClubHeadProfilePage.jsx');
