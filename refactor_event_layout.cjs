const fs = require('fs');

const filePath = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The replacement logic
const startToken = '  const nonHackathonLayout = (';
const endToken = '  return isHackathon ? hackathonLayout : nonHackathonLayout;';

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find the nonHackathonLayout block.");
  process.exit(1);
}

const newLayout = `  const nonHackathonLayout = (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <Navbar />
      
      {/* Banner */}
      {event.bannerImage && (
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
      )}

      <div className={\`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full \${!event.bannerImage ? 'pt-8' : ''}\`}>
        
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
            
            {/* Header Card when no banner */}
            {!event.bannerImage && (
              <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
                  {event.category || 'Event'}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{event.title}</h1>
                {event.shortDescription && <p className="text-gray-600 text-lg mb-8">{event.shortDescription}</p>}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
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
            )}

            {/* Quick Details Grid - ONLY if banner exists */}
            {event.bannerImage && (
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
            )}

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this Event</h2>
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {String(event.description || "No description provided.")}
              </div>
            </div>

            {/* Optional Fields */}
            {event.speaker && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Speaker / Host</h2>
                <p className="text-gray-700">{event.speaker}</p>
              </div>
            )}

            {event.organization && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Organization</h2>
                <p className="text-gray-700">{event.organization}</p>
              </div>
            )}

            {event.eligibility && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Eligibility</h2>
                <p className="text-gray-700">{event.eligibility}</p>
              </div>
            )}

            {event.rules && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Rules & Guidelines</h2>
                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.rules}
                </div>
              </div>
            )}

            {event.certificateProvided && (
              <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
                <CheckCircle className="text-green-500" size={24} />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Certificate Provided</h2>
                  <p className="text-gray-600 text-sm">A certificate of participation will be provided upon completion.</p>
                </div>
              </div>
            )}

            {event.resources && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources & Attachments</h2>
                <p className="text-gray-700">{event.resources}</p>
              </div>
            )}

            {event.contactInfo && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700">{event.contactInfo}</p>
              </div>
            )}

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
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );

`;

content = content.substring(0, startIndex) + newLayout + content.substring(endIndex);
fs.writeFileSync(filePath, content);
console.log('Update applied successfully!');
