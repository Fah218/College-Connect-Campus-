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
  try { const dt = new Date(d); return isValid(dt) ? format(dt, f) : 'TBA' } catch { return 'TBA' }
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
  const [showInbox, setShowInbox]             = useState(true)   // open by default so A sees requests
  const [joinMsg, setJoinMsg]                 = useState({})
  const [registered, setRegistered]           = useState(false)
  const syncedNotifIds = useRef(new Set())

  // resolve hackathon
  const ev = events.find(e => String(e.id) === String(id) && e.category === 'Hackathon')
  const hk = store.hackathons.find(h => String(h.id) === String(id) || String(h._id) === String(id))
  const raw = ev || hk
  if (!raw) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Trophy size={48} className="mb-3 opacity-20" />
        <p className="text-lg font-semibold">Hackathon not found</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-primary-600 hover:underline text-sm">← Go back</button>
      </div>
    </div>
  )

  const h = {
    id: String(raw.id || raw._id),
    title: raw.title,
    shortDesc: raw.shortDescription || '',
    description: raw.description || '',
    date: raw.startDate || raw.date,
    endDate: raw.endDate,
    deadline: raw.registrationDeadlineDate || raw.deadline,
    deadlineTime: raw.registrationDeadlineTime,
    teamSize: raw.maxTeamSize ? `Up to ${raw.maxTeamSize}` : raw.teamSize || 'Team',
    maxParticipants: raw.maxParticipants || raw.capacity,
    location: raw.location || raw.college,
    mode: raw.mode,
    tags: raw.tags || (raw.domain ? [raw.domain] : []),
    prize: raw.prize, bannerImage: raw.bannerImage, club: raw.club,
  }

  const requests    = store.getTeamRequestsForHackathon(h.id)
  const myTeam      = user ? store.getMyTeamForHackathon(h.id, user.id) : null
  const myJoinReqs  = user ? store.getMyJoinRequests(user.id).filter(j => j.hackathonId === h.id) : []
  const ownerInbox  = user ? store.joinRequests.filter(jr =>
    requests.some(r => r._id === jr.teamRequestId && String(r.owner?.id) === String(user.id))
  ) : []
  const pendingInbox = ownerInbox.filter(j => j.status === 'pending')

  // ── Sync ALL hackathon-store notifications → authStore Navbar bell ──────────
  // Covers BOTH User A (join requests) and User B (accept/reject updates)
  const allMyHackNotifs = user ? store.getUserNotifications(user.id) : []
  useEffect(() => {
    if (!user?.id) return
    allMyHackNotifs.forEach(n => {
      if (!syncedNotifIds.current.has(n.id)) {
        syncedNotifIds.current.add(n.id)
        addNotification({
          title:    n.type === 'join_request' ? '🔔 New Join Request'
                  : n.type === 'accepted'     ? '✅ Team Request Accepted'
                  : '❌ Team Request Update',
          message:  n.text,
          priority: n.type === 'join_request' ? 'high' : 'medium',
          id:       n.id
        })
        store.markUserNotifRead(user.id, n.id)
      }
    })
  }, [allMyHackNotifs.length])

  const handleRegister = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setRegistered(true)
    addNotification({ title: 'Team Registered!', message: `Registered for ${h.title}`, priority: 'high' })
  }

  const handleSendJoin = (reqId) => {
    if (!isAuthenticated) { navigate('/login'); return }
    const msg = joinMsg[reqId] || ''
    store.sendJoinRequest(reqId, {
      id: user.id, name: user.name, email: user.email,
      skills: user.skills || [], department: user.department, year: user.year
    }, msg)
    // Notify User B (the sender) via authStore — shows in their Navbar bell
    addNotification({ title: 'Request Sent ✅', message: 'Your join request was sent to the team owner!', priority: 'medium' })
    setJoinMsg(prev => ({ ...prev, [reqId]: '' }))
  }

  const handleAccept = (jrId) => {
    store.acceptJoinRequest(jrId)
    // The acceptJoinRequest already pushes a hackathon-store notification for User B.
    // We also push it to the current user's authStore for the Navbar.
    addNotification({ title: 'Member Added ✅', message: 'Teammate accepted and added to your team!', priority: 'high' })
  }

  const handleReject = (jrId) => {
    store.rejectJoinRequest(jrId)
    addNotification({ title: 'Request Rejected', message: 'Join request rejected.', priority: 'low' })
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {h.bannerImage
        ? <img src={h.bannerImage} alt={h.title} className="w-full h-52 object-cover" />
        : <div className="w-full h-14 bg-gradient-to-r from-primary-500 to-blue-700" />}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Info Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">Hackathon</span>
                {h.mode && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{h.mode}</span>}
                {h.club && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">by {h.club}</span>}
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">{h.title}</h1>
              {h.shortDesc && <p className="text-gray-500 italic mt-1">{h.shortDesc}</p>}
            </div>
            <Trophy size={48} className="text-yellow-500 shrink-0 ml-4" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {h.date && <InfoCard icon={Calendar} label="Start Date" value={safeFormat(h.date)} />}
            {h.deadline && <InfoCard icon={Clock} label="Reg. Deadline" value={`${safeFormat(h.deadline)}${h.deadlineTime ? ' at ' + h.deadlineTime : ''}`} highlight />}
            <InfoCard icon={Users} label="Team Size" value={h.teamSize} />
            {h.location && <InfoCard icon={MapPin} label="Location" value={h.location} />}
            {h.maxParticipants && <InfoCard icon={Users} label="Max Participants" value={h.maxParticipants} />}
            {h.prize && <InfoCard icon={Award} label="Prize Pool" value={h.prize} />}
          </div>
          {h.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t">
              {h.tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm border border-primary-100">
                  <Tag size={11} />{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Description ── */}
        {h.description && (
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-xl font-bold mb-3">About this Hackathon</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{h.description}</p>
          </div>
        )}

        {/* ── Team Section ── */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">👥 Team Section</h2>
            {isAuthenticated && pendingInbox.length > 0 && (
              <button onClick={() => setShowInbox(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-xl font-semibold text-sm hover:bg-yellow-100">
                <Bell size={16} /> {pendingInbox.length} Join Request{pendingInbox.length > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Inbox for team owner */}
          {showInbox && pendingInbox.length > 0 && (
            <div className="mb-6 space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="font-bold text-yellow-800 mb-3">📬 Join Requests (Pending)</h3>
              {pendingInbox.map(jr => (
                <div key={jr._id} className="flex items-center justify-between bg-white border rounded-xl p-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{jr.sender?.name}</p>
                    <p className="text-xs text-gray-500">{jr.sender?.department} · {jr.sender?.year}</p>
                    {jr.sender?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {jr.sender.skills.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                    {jr.message && <p className="text-sm text-gray-600 mt-1.5 italic">"{jr.message}"</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleAccept(jr._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-1">
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button onClick={() => handleReject(jr._id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 flex items-center gap-1">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Team (if already in one) */}
          {myTeam && (
            <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                Your Team: {myTeam.teamName || 'My Team'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {myTeam.members?.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-green-100 rounded-lg p-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                    {i === 0 && <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Owner</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button onClick={handleRegister} disabled={registered}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition
                ${registered ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default' : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}>
              <CheckCircle size={20} />
              {registered ? 'Team Registered ✓' : 'Register Team'}
            </button>
            <button onClick={() => setShowTeamSection(v => !v)}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2
                ${showTeamSection ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-md'}`}>
              <Search size={20} />
              {showTeamSection ? 'Hide Teammates' : 'Find Teammates'}
              {showTeamSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* ── Expanded Teammate Section ── */}
          {showTeamSection && (
            <div className="border-t pt-6 space-y-6">

              {/* Open Requests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">📢 Open Team Requests</h3>
                  {isAuthenticated && !myTeam && (
                    <button onClick={() => setShowPostForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                      <Plus size={16} /> Post Request
                    </button>
                  )}
                </div>

                {requests.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl text-gray-400">
                    <p className="font-medium">No team requests yet</p>
                    <p className="text-sm mt-1">Be the first to post!</p>
                    {isAuthenticated && !myTeam && (
                      <button onClick={() => setShowPostForm(true)}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">
                        Post a Request
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map(req => {
                      const isOwner  = String(req.owner?.id) === String(user?.id)
                      const myJR     = myJoinReqs.find(j => j.teamRequestId === req._id)
                      // User B is a member if they appear in req.members (added after accept)
                      const isMember = !isOwner && req.members?.some(m => String(m.id) === String(user?.id))

                      return (
                        <div key={req._id} className="border rounded-xl p-5 hover:border-primary-300 transition bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              {req.teamName && <p className="font-bold text-primary-700 text-base">{req.teamName}</p>}
                              <p className="text-xs text-gray-400 mt-0.5">by {req.owner?.name}</p>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {req.members?.length || 1} member{req.members?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{req.description}</p>

                          {req.requiredRoles?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="text-xs font-semibold text-gray-500 mr-1">Looking for:</span>
                              {req.requiredRoles.map((r, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                  {r.count ? `${r.count}× ` : ''}{r.role || r}
                                </span>
                              ))}
                            </div>
                          )}
                          {req.requiredSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {req.requiredSkills.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{s}</span>
                              ))}
                            </div>
                          )}

                          {/* Action */}
                          {isOwner ? (
                            <p className="text-xs text-primary-600 font-semibold">✓ Your team request</p>
                          ) : isMember ? (
                            <p className="text-xs text-green-600 font-semibold">✓ You are a member</p>
                          ) : myJR ? (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                              myJR.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              myJR.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                              {myJR.status === 'accepted' ? '✅ Accepted' : myJR.status === 'rejected' ? '❌ Not accepted' : '⏳ Request sent'}
                            </span>
                          ) : (
                            <div className="flex gap-2 mt-2">
                              <textarea
                                value={joinMsg[req._id] || ''}
                                onChange={e => setJoinMsg(p => ({ ...p, [req._id]: e.target.value }))}
                                placeholder="Why are you a good fit? (optional)"
                                className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none"
                                rows={2}
                              />
                              <button onClick={() => handleSendJoin(req._id)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 self-end">
                                Request to Join
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPostForm && (
        <PostRequestModal
          hackathonId={h.id}
          user={user}
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

function InfoCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${highlight ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-transparent'}`}>
      <div className={`p-2 rounded-lg shrink-0 ${highlight ? 'bg-red-100' : 'bg-primary-100'}`}>
        <Icon size={18} className={highlight ? 'text-red-600' : 'text-primary-600'} />
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-red-500' : 'text-gray-400'}`}>{label}</p>
        <p className="font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function PostRequestModal({ onClose, onSubmit, user }) {
  const [form, setForm] = useState({ teamName: '', description: '', requiredRoles: [], requiredSkills: [] })

  const toggleRole = (role) => setForm(p => ({
    ...p,
    requiredRoles: p.requiredRoles.find(r => r.role === role)
      ? p.requiredRoles.filter(r => r.role !== role)
      : [...p.requiredRoles, { role, count: 1 }]
  }))

  const toggleSkill = (s) => setForm(p => ({
    ...p,
    requiredSkills: p.requiredSkills.includes(s) ? p.requiredSkills.filter(x => x !== s) : [...p.requiredSkills, s]
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Post Team Request</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name (optional)</label>
            <input value={form.teamName} onChange={e => setForm(p => ({ ...p, teamName: e.target.value }))}
              placeholder="e.g. MERN Wizards" className="w-full px-4 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What are you building? Who do you need?" className="w-full px-4 py-2 border rounded-lg text-sm" rows={3} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Required Roles</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => {
                const active = form.requiredRoles.find(x => x.role === r)
                return (
                  <div key={r} className="flex items-center gap-1">
                    <button type="button" onClick={() => toggleRole(r)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {r}
                    </button>
                    {active && (
                      <input type="number" min={1} max={5} value={active.count}
                        onChange={e => setForm(p => ({ ...p, requiredRoles: p.requiredRoles.map(x => x.role === r ? { ...x, count: parseInt(e.target.value) || 1 } : x) }))}
                        className="w-10 text-center border rounded text-sm px-1 py-0.5" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Skills Needed</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${form.requiredSkills.includes(s) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t">
            <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm">Cancel</button>
            <button onClick={() => { if (form.description.trim()) onSubmit(form) }}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 text-sm">
              Post Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
