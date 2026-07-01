const fs = require('fs');
const filePath = 'src/pages/HackathonDetails.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Banner section
const oldBannerSection = `{/* Banner */}
      {h.bannerImage ? (
        <div className="w-full h-64 md:h-96 relative">
          <img src={h.bannerImage} alt={h.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <span className="inline-block px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              Hackathon
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-md">{h.title}</h1>
            {h.shortDesc && (
              <p className="text-gray-200 text-lg md:text-xl max-w-3xl drop-shadow-sm">{h.shortDesc}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full pt-12 pb-8 bg-gradient-to-r from-primary-900 to-indigo-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              Hackathon
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">{h.title}</h1>
            {h.shortDesc && <p className="text-gray-200 text-lg md:text-xl max-w-3xl">{h.shortDesc}</p>}
          </div>
        </div>
      )}`;

const newBannerSection = `{/* Banner */}
      {h.bannerImage && (
        <div className="w-full h-64 md:h-96 relative">
          <img src={h.bannerImage} alt={h.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <span className="inline-block px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              Hackathon
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-md">{h.title}</h1>
            {h.shortDesc && (
              <p className="text-gray-200 text-lg md:text-xl max-w-3xl drop-shadow-sm">{h.shortDesc}</p>
            )}
          </div>
        </div>
      )}`;

content = content.replace(oldBannerSection, newBannerSection);

// Insert the title card in the left column if no banner exists
const leftColumnStart = `{/* Left Column: Main Content */}
          <div className="lg:col-span-8 space-y-8">`;

const heroCardInjection = `{/* Left Column: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Card when no banner */}
            {!h.bannerImage && (
              <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
                  Hackathon
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{h.title}</h1>
                {h.shortDesc && <p className="text-gray-600 text-lg">{h.shortDesc}</p>}
              </div>
            )}`;

content = content.replace(leftColumnStart, heroCardInjection);

fs.writeFileSync(filePath, content);
console.log('Update applied successfully!');
