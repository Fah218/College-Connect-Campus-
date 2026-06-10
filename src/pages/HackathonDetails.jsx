import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import { Calendar, Clock, Users, Trophy, MapPin, Tag, Award, Plus, X, CheckCircle, ChevronDown, ChevronUp, Search, Bell } from 'lucide-react'
import { format, isValid } from 'date-fns'

function safeFormat(d, f = 'MMM dd, yyyy') {
  if (!d) return 'TBA'
  try {
    const dt = new Date(d)
    return isValid(dt) ? format(dt, f) : 'TBA'
  } catch { return 'TBA' }
}

const ROLES = ['Frontend','Backend','Full-Stack','ML Engineer','Designer','DevOps','Mobile Dev']
const SKILLS = ['React','Node.js','Python','TensorFlow','Figma','MongoDB','AWS','Flutter','Django','UI/UX']

export default function HackathonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useHackathonStore()
  const { events } = useEventStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()

  const [showTeamSection, setShowTeamSection] = useState(false)
  const [showPostForm, setShowPostForm]       = useState(false)
  const [showInbox, setShowInbox]             = useState(true)
  const [joinMsg, setJoinMsg]                 = useState({})
  const [registered, setRegistered]           = useState(false)
  const syncedNotifIds = useRef(new Set())

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

  const requests = store.getTeamRequestsForHackathon?.(h.id) || []
  const myTeam = user ? store.getMyTeamForHackathon?.(h.id, user.id) : null
  const myJoinReqs = user ? (store.getMyJoinRequests?.(user.id) || []).filter(j => String(j.hackathonId) === h.id) : []
  
  const isTeamOwner = myTeam && user && String(myTeam.owner?.id) === String(user.id);

  // Only Team Lead can see the inbox
  const teamInbox = isTeamOwner ? (store.joinRequests || []).filter(jr => 
    String(jr.teamRequestId) === String(myTeam._id) || String(jr.teamRequestId) === String(myTeam.id)
  ) : []
  const pendingInbox = teamInbox.filter(j => j.status === 'pending')

  // Calculate max team size from string like "Up to 4" or "4", but myTeam already has teamSizeLimit
  const hMaxTeamSize = myTeam?.teamSizeLimit || parseInt(String(h.teamSize).replace(/\D/g, '')) || 4;

  const handleRegister = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setRegistered(true)
    addNotification({ title: 'Success!', message: `Registered for ${h.title}`, priority: 'high' })
  }

  const handleSendJoin = (reqId, details) => {
    if (!isAuthenticated) { navigate('/login'); return }
    const msg = joinMsg[reqId] || ''
    store.sendJoinRequest?.(reqId, {
      id: user.id, name: user.name, email: user.email,
      skills: user.skills || [], department: user.department, year: user.year
    }, msg, details)
    addNotification({ title: 'Request Sent', message: 'Join request sent!', priority: 'medium' })
    setJoinMsg(p => ({ ...p, [reqId]: '' }))
    setJoinForm(p => ({ ...p, [reqId]: false }))
  }

  const [joinForm, setJoinForm] = useState({})
  const [joinDetails, setJoinDetails] = useState({})

  const toggleJoinForm = (reqId) => {
    setJoinForm(p => ({ ...p, [reqId]: !p[reqId] }))
    if (!joinDetails[reqId]) {
      setJoinDetails(p => ({ ...p, [reqId]: { github: '', portfolio: '', linkedin: '', skills: '' } }))
    }
  }

  const updateJoinDetails = (reqId, field, value) => {
    setJoinDetails(p => ({
      ...p,
      [reqId]: { ...p[reqId], [field]: value }
    }))
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

        {/* Team Actions */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Teammate Finder</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button onClick={handleRegister} disabled={registered}
              className={`flex-1 py-3 rounded-xl font-bold transition ${registered ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {registered ? '✓ Registered' : 'Register Team'}
            </button>
            <button onClick={() => setShowTeamSection(!showTeamSection)}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
              {showTeamSection ? 'Hide Finder' : 'Find Teammates'}
            </button>
          </div>

          {/* Inbox for User A */}
          {showInbox && pendingInbox.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2"><Bell size={18} /> New Requests</h3>
              {pendingInbox.map(jr => (
                <div key={jr._id} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{jr.sender?.name}</p>
                      <p className="text-xs text-gray-600 italic">"{jr.message || 'No message'}"</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => store.acceptJoinRequest?.(jr._id)} className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700">Accept</button>
                      <button onClick={() => store.rejectJoinRequest?.(jr._id)} className="px-4 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100">Reject</button>
                    </div>
                  </div>
                  
                  {/* Links and Skills */}
                  <div className="bg-gray-50 rounded-lg p-3 text-xs border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {jr.githubLink && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-500">GitHub:</span>
                          <a href={jr.githubLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline truncate">{jr.githubLink}</a>
                        </div>
                      )}
                      {jr.portfolioLink && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-500">Portfolio:</span>
                          <a href={jr.portfolioLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline truncate">{jr.portfolioLink}</a>
                        </div>
                      )}
                      {jr.linkedinLink && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-500">LinkedIn:</span>
                          <a href={jr.linkedinLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline truncate">{jr.linkedinLink}</a>
                        </div>
                      )}
                    </div>
                    {jr.sender?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-500 mr-1 mt-0.5">Skills:</span>
                        {jr.sender.skills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Team Display */}
          {myTeam && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-primary-800 text-lg">My Team: {myTeam.teamName || 'Team'}</p>
                  <p className="text-xs font-semibold text-primary-600 mt-1">{(myTeam.members || []).length} / {hMaxTeamSize} Members ({hMaxTeamSize - (myTeam.members || []).length} slots remaining)</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2 py-1 text-white text-[10px] rounded font-bold uppercase ${myTeam.status === 'full' ? 'bg-red-500' : 'bg-primary-600'}`}>
                    {myTeam.status === 'full' ? 'Team Full' : 'Recruiting'}
                  </div>
                  {isTeamOwner && myTeam.status !== 'full' && (
                    <button onClick={() => setShowInbox(!showInbox)} className="px-3 py-1 bg-white border border-primary-300 text-primary-700 text-[10px] font-bold rounded shadow-sm hover:bg-primary-50">
                      {showInbox ? 'Hide Requests' : `View Join Requests (${pendingInbox.length})`}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {(myTeam.members || []).map((m, idx) => m && (
                  <div key={m.id || m._id || idx} className="flex items-center justify-between bg-white border border-primary-100 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {String(m.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{String(m.name || 'Unknown')}</p>
                        <p className="text-[10px] text-gray-500">{m.email}</p>
                      </div>
                    </div>
                    {m.id === myTeam.owner?.id ? (
                      <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase">Lead</span>
                    ) : (
                      <a href={`mailto:${m.email}`} className="text-[10px] text-primary-600 hover:underline font-medium">Contact</a>
                    )}
                  </div>
                ))}
              </div>
            </div>

          )}

          {/* List of Requests */}
          {showTeamSection && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Team Requests</h3>
                {!myTeam && <button onClick={() => setShowPostForm(true)} className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg font-bold">Post Request</button>}
              </div>
              {requests.map(req => {
                const memberCount = (req.members || []).length;
                const reqTeamSizeLimit = req.teamSizeLimit || hMaxTeamSize;
                // If team is full, do not show the team request in the browse list
                if (req.status === 'full' || memberCount >= reqTeamSizeLimit) return null;

                const isOwner = user?.id && req.owner?.id && String(req.owner.id) === String(user.id)
                const isMember = user?.id && (req.members || []).some(m => m && String(m.id || m._id || '') === String(user.id))
                const myJR = user?.id && myJoinReqs.find(j => String(j.teamRequestId) === String(req._id) || String(j.teamRequestId) === String(req.id))

                return (
                  <div key={req._id} className="border rounded-xl p-4 bg-gray-50 hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{String(req.teamName || 'Unnamed Team')}</p>
                        <p className="text-xs font-semibold text-primary-600 mt-0.5">{memberCount} / {reqTeamSizeLimit} Members</p>
                      </div>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        Request
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{String(req.description)}</p>

                    {/* Roles Needed */}
                    {req.requiredRoles?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Roles Needed</p>
                        <div className="flex flex-wrap gap-2">
                          {req.requiredRoles.map((r, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-[11px] font-bold border border-primary-100">
                              {r.role} ({r.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Needed */}
                    {req.requiredSkills?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Skills Preferred</p>
                        <div className="flex flex-wrap gap-1.5">
                          {req.requiredSkills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-medium border border-purple-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t">

                      {isOwner ? <span className="text-xs font-bold text-primary-600">Your Post</span> :
                       isMember ? <span className="text-xs font-bold text-green-600">✓ You are in this team</span> :
                       myJR ? <span className="text-xs font-bold text-yellow-600">⏳ Request {myJR.status}</span> :
                       <div className="flex flex-col gap-2">
                         {!joinForm[req._id] ? (
                           <button onClick={() => toggleJoinForm(req._id)} className="self-start px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-700">Request to Join</button>
                         ) : (
                           <div className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm mt-2">
                             <h4 className="text-xs font-bold text-primary-800 mb-3">Complete Join Request</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                               <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">GitHub URL <span className="text-red-500">*</span></label>
                                 <input value={joinDetails[req._id]?.github || ''} onChange={e => updateJoinDetails(req._id, 'github', e.target.value)} placeholder="https://github.com/..." className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-primary-300" />
                               </div>
                               <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Portfolio URL</label>
                                 <input value={joinDetails[req._id]?.portfolio || ''} onChange={e => updateJoinDetails(req._id, 'portfolio', e.target.value)} placeholder="https://..." className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-primary-300" />
                               </div>
                               <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">LinkedIn URL</label>
                                 <input value={joinDetails[req._id]?.linkedin || ''} onChange={e => updateJoinDetails(req._id, 'linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-primary-300" />
                               </div>
                               <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Your Skills</label>
                                 <input value={joinDetails[req._id]?.skills || ''} onChange={e => updateJoinDetails(req._id, 'skills', e.target.value)} placeholder="React, Node.js, UI/UX" className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-primary-300" />
                                 <p className="text-[9px] text-gray-400 mt-0.5">Comma separated list</p>
                               </div>
                             </div>
                             
                             <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Message to Lead</label>
                             <textarea value={joinMsg[req._id] || ''} onChange={e => setJoinMsg(p => ({...p, [req._id]: e.target.value}))} placeholder="Why are you a good fit?" rows={2} className="w-full px-3 py-1.5 border rounded-lg text-xs mb-3 focus:ring-2 focus:ring-primary-300" />
                             
                             <div className="flex gap-2 justify-end">
                               <button onClick={() => toggleJoinForm(req._id)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                               <button onClick={() => handleSendJoin(req._id, joinDetails[req._id])} disabled={!joinDetails[req._id]?.github} className="px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-700 disabled:opacity-50">Submit Request</button>
                             </div>
                           </div>
                         )}
                       </div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showPostForm && (
        <PostRequestModal
          onClose={() => setShowPostForm(false)}
          onSubmit={(data) => {
            store.addTeamRequest({ ...data, hackathonId: h.id, owner: { id: user.id, name: user.name, email: user.email } })
            addNotification({ title: 'Request Posted', message: 'Your team request is live!', priority: 'medium' })
            setShowPostForm(false)
          }}
        />
      )}
    </div>
  )
}

function PostRequestModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    teamName: '',
    description: '',
    requiredRoles: [],
    requiredSkills: []
  })

  const toggleRole = (role) => {
    setForm(prev => {
      const exists = prev.requiredRoles.find(r => r.role === role)
      if (exists) {
        return { ...prev, requiredRoles: prev.requiredRoles.filter(r => r.role !== role) }
      }
      return { ...prev, requiredRoles: [...prev.requiredRoles, { role, count: 1 }] }
    })
  }

  const updateRoleCount = (role, count) => {
    setForm(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.map(r => r.role === role ? { ...r, count: parseInt(count) || 1 } : r)
    }))
  }

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Post Team Request</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name (Optional)</label>
            <input
              type="text"
              value={form.teamName}
              onChange={e => setForm({ ...form, teamName: e.target.value })}
              placeholder="e.g. Code Wizards"
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Required Roles</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => {
                const active = form.requiredRoles.find(r => r.role === role)
                return (
                  <div key={role} className="flex items-center gap-1">
                    <button
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 hover:border-primary-400'
                      }`}
                    >
                      {role}
                    </button>
                    {active && (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={active.count}
                        onChange={e => updateRoleCount(role, e.target.value)}
                        className="w-12 px-1 py-1 text-center border rounded-lg text-xs font-bold"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Skills Needed</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.requiredSkills.includes(skill)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 hover:border-purple-400'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us what you're building and who you're looking for..."
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-28 resize-none"
              required
            />
          </div>

          <button
            onClick={() => {
              if (form.description.trim()) onSubmit(form)
            }}
            className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
          >
            Submit Request
          </button>
        </div>
      </div>
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
