import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import { Calendar, Clock, Users, Trophy, MapPin, Tag, Award, Plus, X, CheckCircle, ChevronDown, ChevronUp, Search, Bell, Maximize2 } from 'lucide-react'
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
    additionalImage: (raw.additionalImages?.[0] || raw.additionalImage),
    contactName: raw.contactName,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone,
    eligibility: raw.eligibility,
    domains: raw.domains,
    winnerRewards: raw.winnerRewards,
    problemStatementPdf: raw.problemStatementPdf,
    teamSizeMin: raw.teamSizeMin,
    teamFormationAllowed: raw.teamFormationAllowed !== undefined ? raw.teamFormationAllowed : true,
    club: raw.club,
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



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="rounded-2xl overflow-hidden mb-6 shadow-sm border h-48 bg-gray-200">
          {h.bannerImage ? (
            <img src={h.bannerImage} className="w-full h-full object-cover" alt={h.title} />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-blue-800 flex items-center justify-center">
              <Trophy size={64} className="text-white opacity-20" />
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h1 className="text-3xl font-extrabold mb-4">{String(h.title)}</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={Calendar} label="Starts" value={`${safeFormat(h.date)}${h.time ? ' at ' + h.time : ''}`} />
            {h.endDate && <InfoCard icon={Calendar} label="Ends" value={`${safeFormat(h.endDate)}${h.endTime ? ' at ' + h.endTime : ''}`} />}
            <InfoCard icon={Clock} label="Deadline" value={`${safeFormat(h.deadline)}${h.deadlineTime ? ' at ' + h.deadlineTime : ''}`} highlight />
            <InfoCard icon={Users} label="Team Size" value={h.teamSize} />
            <InfoCard icon={MapPin} label="Location" value={`${h.location} (${h.mode})`} />
            {h.venueLink && <InfoCard icon={MapPin} label="Venue Link" value={h.venueLink} />}
            {h.maxParticipants && <InfoCard icon={Users} label="Capacity" value={h.maxParticipants} />}
            {h.prize && <InfoCard icon={Award} label="Prize" value={h.prize} />}
          </div>
          {h.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {h.tags.map((t, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs border border-primary-100">
                  {String(t)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Hackathon Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Event Details</h2>
          <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700">
            {h.eligibility && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Eligibility</p>
                <p className="font-medium">{h.eligibility}</p>
              </div>
            )}
            {h.domains && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Domains</p>
                <p className="font-medium">{h.domains}</p>
              </div>
            )}
            {h.winnerRewards && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Winner Rewards</p>
                <p className="font-medium">{h.winnerRewards}</p>
              </div>
            )}
            {h.contactName && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Contact</p>
                <p className="font-medium">{h.contactName} ({h.contactPhone})</p>
                <p className="text-sm text-blue-600"><a href={`mailto:${h.contactEmail}`}>{h.contactEmail}</a></p>
              </div>
            )}
            {h.problemStatementPdf && (
              <div className="md:col-span-2 pt-2 border-t mt-2">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Resources</p>
                <a href={h.problemStatementPdf} download={`${h.title.replace(/\s+/g, '_')}_Problem_Statement.pdf`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold transition border border-purple-200">
                  📄 Download Problem Statement
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">About this Hackathon</h2>
          {h.shortDesc && (
            <p className="text-gray-600 font-medium italic mb-4 border-l-4 border-primary-400 pl-4">
              {String(h.shortDesc)}
            </p>
          )}
          <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {String(h.description || "No description provided.")}
          </div>
        </div>


        {h.additionalImages && h.additionalImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">Event Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {h.additionalImages.map((imgUrl, idx) => (
                <div key={idx} className="relative group overflow-hidden rounded-xl cursor-pointer shadow-sm border border-gray-100 bg-gray-50 aspect-[4/3]" onClick={() => setModalImageSrc(imgUrl)}>
                  <img 
                    src={imgUrl} 
                    alt={`Gallery image ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-sm px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">View Full</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Actions */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Registration & Teams</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleRegister} disabled={isRegisteredBackend}
              className={`flex-1 py-3 rounded-xl font-bold transition ${isRegisteredBackend ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {isRegisteredBackend ? '✓ Registered' : 'Register'}
            </button>
            <Link to={`/hackathons/${id}/teammates`}
              className="flex-1 py-3 text-center bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
              Find Teammates
            </Link>
          </div>
        </div>
      </div>
      {/* Image Modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}


function InfoCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 ${highlight ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-transparent'}`}>
      <div className={`p-2 rounded-lg ${highlight ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}><Icon size={18} /></div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-gray-800">{String(value || 'TBA')}</p>
      </div>
    </div>
  )
}
