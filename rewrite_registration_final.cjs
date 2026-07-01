const fs = require('fs');
let path = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix isLoading missing
content = content.replace(
  `const { events } = useEventStore()`,
  `const { events, isLoading } = useEventStore()`
);

// Find the final return statement
const returnStart = content.indexOf('  return (\n    <div className="min-h-screen bg-gray-50 pb-16">');
const beforeReturn = content.slice(0, returnStart);
const oldReturnStr = content.slice(returnStart);

// oldReturnStr is:
// "  return (\n    <div className="..."...</div>\n  )\n}"
// We need exactly the JSX string, which starts after "  return (\n" and ends before "\n  )\n}"

let innerJSX = oldReturnStr.replace(/^[\s\S]*?return \(\n/, ''); // strip "  return (\n"
innerJSX = innerJSX.replace(/\n\s*\)\n\}\s*$/, ''); // strip final "  )\n}"

const splitLogic = `
  const hackathonLayout = (
${innerJSX}
  );

  const renderRegistrationCard = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">Registration</h3>
        
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Status</span>
          <span className={\`px-3 py-1 rounded-full text-xs font-bold uppercase \${isApproved && !isPastDeadline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
            {!isApproved ? 'Not Approved' : isPastDeadline ? 'Closed' : 'Open'}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Seats Remaining</span>
          <span className="text-sm font-semibold text-gray-900">
            {event.capacity ? Math.max(0, event.capacity - (event.attendees || 0)) : 'Unlimited'}
          </span>
        </div>

        {/* Participation Type */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">Participation</span>
          <span className="text-sm font-semibold text-gray-900">
            {event.participationType === 'Team' ? 'Team' : 'Individual'}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-3">
            <ShieldAlert size={20} className="mt-0.5 flex-shrink-0" />
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        {isRegisteredBackend ? (
          <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-green-800">You're Registered!</h3>
            <p className="text-sm text-green-600 mt-1">Check your dashboard for details.</p>
          </div>
        ) : (
          <>
            {event.participationType === 'Team' ? (
              <form onSubmit={handleNonHackathonTeamRegistration} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                  <input type="text" value={offlineTeamData.title} onChange={(e) => setOfflineTeamData({ ...offlineTeamData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" required placeholder="e.g. The Innovators" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Team Members</h4>
                  
                  {/* Team Lead */}
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <div className="text-xs font-bold text-primary-700 mb-2">Team Lead</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={user?.name || ''} disabled className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded text-gray-600 text-xs cursor-not-allowed" />
                      <input type="email" value={user?.email || ''} disabled className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded text-gray-600 text-xs cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Members */}
                  {offlineTeamData.members.map((member, idx) => (
                    <div key={idx} className="bg-white border rounded-lg p-3 relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700">Member {idx + 1}</span>
                        <button type="button" onClick={() => removeOfflineMember(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input type="text" required value={member.name} onChange={(e) => updateOfflineMember(idx, 'name', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" placeholder="Full Name" />
                        <input type="email" required value={member.email} onChange={(e) => updateOfflineMember(idx, 'email', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" placeholder="Email" />
                        <input type="tel" value={member.phone} onChange={(e) => updateOfflineMember(idx, 'phone', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" placeholder="Phone (Optional)" />
                      </div>
                    </div>
                  ))}

                  {offlineTeamData.members.length + 1 < (event.maxTeamSize || 99) && (
                    <button type="button" onClick={addOfflineMember} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600 hover:border-primary-400 hover:text-primary-600">
                      + Add Member
                    </button>
                  )}
                  
                  <p className="text-[10px] text-gray-500 text-center">
                    Size: {offlineTeamData.members.length + 1} / {event.maxTeamSize || 'Unlimited'} 
                  </p>
                </div>
                <button type="submit" disabled={loading || !offlineTeamData.title || !isApproved || isPastDeadline} className="w-full mt-4 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 text-sm transition-colors">
                  {loading ? 'Processing...' : 'Register Team'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleIndividualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm" required />
                  </div>
                </div>
                <button type="submit" disabled={loading || !isApproved || isPastDeadline} className="w-full mt-2 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 text-sm transition-colors">
                  {loading ? 'Processing...' : 'Register Now'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    );
  };

  const nonHackathonLayout = (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <Navbar />
      
      {/* Banner */}
      {event.bannerImage ? (
        <div className="w-full h-64 md:h-96 relative">
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <span className="inline-block px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              {event.category || 'Event'}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-md">{event.title}</h1>
            {event.shortDescription && (
              <p className="text-gray-200 text-lg md:text-xl max-w-3xl drop-shadow-sm">{event.shortDescription}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full pt-12 pb-8 bg-gradient-to-r from-primary-900 to-indigo-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {event.category || 'Event'}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">{event.title}</h1>
            {event.shortDescription && <p className="text-gray-200 text-lg md:text-xl max-w-3xl">{event.shortDescription}</p>}
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {!isApproved && (
          <div className="mb-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-3 border border-yellow-200 shadow-sm">
            <ShieldAlert size={20} />
            <p className="font-medium">This event is not yet approved. Registration is disabled.</p>
          </div>
        )}

        {isPastDeadline && (
          <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-3 border border-red-200 shadow-sm">
            <Calendar size={20} />
            <p className="font-medium">The registration deadline for this event has passed.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Details Grid */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Date</span></div>
                  <p className="font-semibold text-gray-900">{format(new Date(event.startDate || event.date || new Date()), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Time</span></div>
                  <p className="font-semibold text-gray-900">{event.startTime || event.time}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><MapPin size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Venue</span></div>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                  <p className="text-xs text-gray-500">{event.mode || 'Offline'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><Users size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Organizer</span></div>
                  <p className="font-semibold text-gray-900">{event.club || event.clubName || 'General'}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this Event</h2>
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {String(event.description || "No description provided.")}
              </div>
            </div>

            {/* Gallery */}
            {event.additionalImages && event.additionalImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Event Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {event.additionalImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl cursor-pointer shadow-sm border border-gray-100 aspect-square" onClick={() => setModalImageSrc(imgUrl)}>
                      <img src={imgUrl} alt={\`Gallery image \${idx + 1}\`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-md border border-white/30">View</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-4">
            {renderRegistrationCard()}
          </div>

        </div>
      </div>

      {/* Image Modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );

  return isHackathon ? hackathonLayout : nonHackathonLayout;
}
`;

fs.writeFileSync(path, beforeReturn + splitLogic);
console.log("Rewrote properly without string corruption.");
