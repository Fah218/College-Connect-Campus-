import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import ImageViewer from '../components/ImageViewer'
import { Calendar, Clock, Users, Trophy, MapPin, Tag, Award, Plus, X, CheckCircle, ChevronDown, ChevronUp, Search, Maximize2, ExternalLink, Mail, ShieldAlert } from 'lucide-react'
import { format, isValid } from 'date-fns'

function safeFormat(d, f = 'MMM dd, yyyy') {
  if (!d) return 'TBA'
  try {
    const dt = new Date(d)
    return isValid(dt) ? format(dt, f) : 'TBA'
  } catch { return 'TBA' }
}

export default function HackathonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useHackathonStore()
  const { events, isLoading } = useEventStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()
  const [modalImageSrc, setModalImageSrc] = useState(null)
  const [viewerImages, setViewerImages] = useState(null)
  const [viewerIndex, setViewerIndex] = useState(0)

  // Strip prefixes (ev- or st-) if present for searching
  const cleanId = id?.replace(/^(ev-|st-)/, '')

  // Find hackathon from either store
  const ev = (events || []).find(e => String(e.id) === String(cleanId) && e.category === 'Hackathon')
  const hk = (store.hackathons || []).find(h => String(h.id) === String(cleanId) || String(h._id) === String(cleanId))
  const raw = ev || hk

  if (!raw) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <Trophy size={48} className="mb-3 opacity-20" />
          <p className="text-lg font-semibold">Hackathon not found</p>
          <button onClick={() => navigate('/hackathons')} className="mt-3 text-primary-600 hover:underline">← All Hackathons</button>
        </div>
      </div>
    )
  }

  const h = {
    id: String(raw.id || raw._id),
    title: raw.title || 'Untitled Hackathon',
    shortDesc: raw.shortDescription || '',
    description: raw.description || '',
    date: raw.startDate || raw.date,
    endDate: raw.endDate,
    time: raw.startTime || raw.time,
    endTime: raw.endTime,
    deadline: raw.registrationDeadlineDate || raw.deadline,
    deadlineTime: raw.registrationDeadlineTime,
    teamSize: raw.maxTeamSize ? `Up to ${raw.maxTeamSize}` : (raw.teamSize || 'Team'),
    location: raw.location || raw.college || 'TBA',
    venueLink: raw.venueLink || raw.platformLink,
    mode: raw.mode || 'Offline',
    maxParticipants: raw.maxParticipants || raw.capacity,
    tags: raw.tags || (raw.domain ? [raw.domain] : []),
    prize: raw.prizePool || raw.prize,
    bannerImage: raw.bannerImage,
    additionalImages: raw.additionalImages || [],
    contactName: raw.contactName,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone,
    eligibility: raw.eligibility,
    domains: raw.domains,
    winnerRewards: raw.winnerRewards,
    problemStatementPdf: raw.problemStatementPdf,
    teamSizeMin: raw.teamSizeMin,
    teamFormationAllowed: raw.teamFormationAllowed !== undefined ? raw.teamFormationAllowed : true,
    club: raw.club || raw.clubName,
    status: raw.status || 'approved'
  }

  const { registrations } = useRegistrationStore()
  const isRegisteredBackend = registrations.some(r => {
    if (String(r.eventId?._id || r.eventId) !== String(h.id)) return false;
    if (r.participationType === 'Individual') {
      return String(r.studentId?._id || r.studentId) === String(user?.id || user?._id);
    }
    if (r.participationType === 'Team' && r.teamId) {
      const isLead = String(r.teamId.createdBy) === String(user?.id || user?._id);
      const isMember = (r.teamId.currentMembers || []).some(m => String(m.id || m._id || m) === String(user?.id || user?._id));
      return isLead || isMember;
    }
    return false;
  })

  const handleRegister = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/events/${h.id}/register`)
  }

  const isApproved = h.status === 'approved'
  
  // Registration deadline logic
  let isPastDeadline = false;
  if (h.deadline) {
    const deadlineStr = h.deadlineTime ? `${h.deadline}T${h.deadlineTime}` : h.deadline;
    if (new Date(deadlineStr) < new Date()) {
      isPastDeadline = true;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <Navbar />
      
      {/* Banner */}
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
      )}

      <div className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full ${!h.bannerImage ? 'pt-8' : ''}`}>
        
        {!isApproved && (
          <div className="mb-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-3 border border-yellow-200 shadow-sm">
            <ShieldAlert size={20} />
            <p className="font-medium">This hackathon is not yet approved. Registration is disabled.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Main Content */}
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
            )}
            
            {/* Quick Details Grid */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Starts</span></div>
                  <p className="font-semibold text-gray-900">{safeFormat(h.date)}</p>
                  {h.time && <p className="text-xs text-gray-500">{h.time}</p>}
                </div>
                {h.endDate && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Ends</span></div>
                    <p className="font-semibold text-gray-900">{safeFormat(h.endDate)}</p>
                    {h.endTime && <p className="text-xs text-gray-500">{h.endTime}</p>}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><Clock size={16} /> <span className="text-xs uppercase font-bold tracking-wider text-red-500">Deadline</span></div>
                  <p className="font-semibold text-gray-900">{safeFormat(h.deadline)}</p>
                  {h.deadlineTime && <p className="text-xs text-gray-500">{h.deadlineTime}</p>}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><Users size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Team Size</span></div>
                  <p className="font-semibold text-gray-900">{h.teamSize}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><MapPin size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Location</span></div>
                  <p className="font-semibold text-gray-900">{h.location}</p>
                  <p className="text-xs text-gray-500">{h.mode}</p>
                </div>
                {h.prize && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><Award size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Prize Pool</span></div>
                    <p className="font-semibold text-gray-900">{h.prize}</p>
                  </div>
                )}
              </div>
              
              {h.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                  {h.tags.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs border border-primary-100 font-medium">
                      {String(t)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this Hackathon</h2>
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {String(h.description || "No description provided.")}
              </div>
            </div>
            
            {/* Eligibility */}
            {h.eligibility && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Eligibility</h2>
                <p className="text-gray-700">{h.eligibility}</p>
              </div>
            )}

            {/* Challenge Tracks / Domains */}
            {h.domains && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Tracks</h2>
                <p className="text-gray-700">{h.domains}</p>
              </div>
            )}

            {/* Judging Criteria / Winner Rewards */}
            {h.winnerRewards && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Prizes & Winner Rewards</h2>
                <p className="text-gray-700">{h.winnerRewards}</p>
              </div>
            )}

            {/* Resources */}
            {h.problemStatementPdf && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>
                <a href={h.problemStatementPdf} download={`${h.title.replace(/s+/g, '_')}_Problem_Statement.pdf`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold transition border border-purple-200">
                  📄 Download Problem Statement
                </a>
              </div>
            )}

            {/* Event Gallery */}
            {h.additionalImages && h.additionalImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Event Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {h.additionalImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl cursor-pointer shadow-sm border border-gray-100 aspect-square" onClick={() => { setViewerImages(h.additionalImages); setViewerIndex(idx); }}>
                      <img src={imgUrl} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-md border border-white/30">View</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizer & Contact Info */}
            {(h.contactName || h.club) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Organizer & Contact</h2>
                <div className="space-y-4">
                  {h.club && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Users size={20} /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{h.club}</p>
                        <p className="text-xs text-gray-500">Organizer</p>
                      </div>
                    </div>
                  )}
                  {h.contactName && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Mail size={20} /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{h.contactName}</p>
                        <p className="text-xs text-blue-600"><a href={`mailto:${h.contactEmail}`} className="hover:underline">{h.contactEmail}</a> {h.contactPhone && `• ${h.contactPhone}`}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column: Sticky Action Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Summary</h3>
              
              <div className="space-y-4 mb-6">
                {isRegisteredBackend ? (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Status</span>
                    <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Registered</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold ${isPastDeadline ? 'text-red-500' : 'text-green-600'}`}>
                      {isPastDeadline ? 'Closed' : 'Open'}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Deadline</span>
                  <span className="font-semibold text-gray-900">{safeFormat(h.deadline)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Team Size</span>
                  <span className="font-semibold text-gray-900">{h.teamSize}</span>
                </div>
                
                {h.prize && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Prize Pool</span>
                    <span className="font-semibold text-primary-600">{h.prize}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Capacity</span>
                  <span className="font-semibold text-gray-900">{h.maxParticipants ? `${h.maxParticipants} participants` : 'Unlimited'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-semibold text-gray-900">{h.mode}</span>
                </div>
              </div>

              <div className="space-y-3">
                {isRegisteredBackend ? (
                  <button disabled className="w-full py-3 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200 flex items-center justify-center gap-2 cursor-not-allowed">
                    <CheckCircle size={18} /> You're Registered!
                  </button>
                ) : (
                  <button 
                    onClick={handleRegister} 
                    disabled={!isApproved || isPastDeadline}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPastDeadline ? 'Registration Closed' : 'Register Now'}
                  </button>
                )}

                {h.teamFormationAllowed && (
                  <Link 
                    to={`/hackathons/${h.id}/teammates`}
                    className="w-full py-3 bg-white text-primary-600 rounded-lg font-bold border border-primary-200 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Users size={18} /> Find Teammates
                  </Link>
                )}
                

                
                {h.contactEmail && (
                  <a 
                    href={`mailto:${h.contactEmail}`}
                    className="w-full py-2 bg-white text-gray-600 rounded-lg font-medium hover:text-gray-900 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Mail size={16} /> Contact Organizer
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Image Modal (legacy) */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2 z-10">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Fullscreen ImageViewer */}
      {viewerImages && (
        <ImageViewer 
          images={viewerImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerImages(null)} 
        />
      )}
    </div>
  )
}
