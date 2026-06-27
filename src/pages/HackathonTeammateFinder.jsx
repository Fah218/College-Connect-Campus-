import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import { Trophy, ArrowLeft, Bell, Search, Filter, X, Lock, Edit2, Trash2 } from 'lucide-react'

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer',
  'UI/UX Designer', 'AI/ML Engineer', 'Data Scientist', 'Data Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Cybersecurity Engineer', 'Blockchain Developer', 'IoT Developer',
  'Embedded Systems Engineer', 'QA / Testing', 'Product Manager', 'Project Coordinator',
  'Researcher', 'Other (Custom)'
]

const SKILLS = [
  'React', 'Next.js', 'Angular', 'Vue.js', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
  'JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'MySQL', 'PostgreSQL',
  'Firebase', 'Python', 'Java', 'C++', 'TensorFlow', 'PyTorch', 'OpenCV', 'LangChain',
  'OpenAI API', 'Gemini API', 'Hugging Face', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'GCP', 'Git', 'GitHub', 'Linux', 'Flutter', 'React Native', 'Kotlin', 'Swift', 'Figma',
  'UI/UX', 'REST API', 'GraphQL', 'Blockchain', 'Solidity', 'Cybersecurity',
  'Machine Learning', 'Generative AI', 'RAG', 'AI Agents', 'Prompt Engineering', 'Other (Custom)'
]

export default function HackathonTeammateFinder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useHackathonStore()
  const { events } = useEventStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()

  const [showPostForm, setShowPostForm]       = useState(false)
  const [showInbox, setShowInbox]             = useState(true)
  const [joinMsg, setJoinMsg]                 = useState({})
  
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

  const cleanId = id?.replace(/^(ev-|st-)/, '')
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
    teamSize: raw.maxTeamSize ? `Up to ${raw.maxTeamSize}` : (raw.teamSize || 'Team'),
  }

  const allRequests = store.getTeamRequestsForHackathon?.(h.id) || []
  const myTeam = user ? store.getMyTeamForHackathon?.(h.id, user.id || user._id) : null
  const myJoinReqs = user ? (store.getMyJoinRequests?.(user.id || user._id) || []).filter(j => String(j.hackathonId) === String(h.id)) : []
  
  const isTeamOwner = myTeam && user && String(myTeam.createdBy) === String(user.id);

  const teamInbox = isTeamOwner ? (store.joinRequests || []).filter(jr => 
    String(jr.teamRequestId) === String(myTeam._id) || String(jr.teamRequestId) === String(myTeam.id)
  ) : []
  const pendingInbox = teamInbox.filter(j => j.status === 'pending')

  const hMaxTeamSize = myTeam?.teamSizeLimit || parseInt(String(h.teamSize).replace(/\D/g, '')) || 4;

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

  const handleDeleteTeamRequest = async (teamReqId) => {
    if (window.confirm('Are you sure you want to delete this team request?')) {
      try {
        await store.deleteTeamRequest(teamReqId);
        addNotification({ title: 'Deleted', message: 'Team request deleted successfully', priority: 'medium' });
      } catch (err) {
        addNotification({ title: 'Error', message: err.response?.data?.message || err.message, priority: 'high' });
      }
    }
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
  
  // Filter Open Requests
  const activeRequests = allRequests.filter(req => req.status === 'open' && ((req.currentMembers || []).length + 1) < (req.teamSizeLimit || hMaxTeamSize))

  // Apply User Filters
  const filteredRequests = activeRequests.filter(req => {
    const matchesSearch = (req.teamName || req.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (req.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === '' || (req.requiredRoles || []).some(r => r.role === roleFilter)
    const matchesSkill = skillFilter === '' || (req.requiredSkills || []).includes(skillFilter)
    
    return matchesSearch && matchesRole && matchesSkill
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to={`/hackathons/${h.id}`} className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline mb-6">
          <ArrowLeft size={16} /> Back to Hackathon Details
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teammate Finder</h1>
            <p className="text-gray-600 text-lg">Find the perfect team for <span className="font-semibold text-gray-800">{h.title}</span></p>
          </div>
          {!myTeam && (
            <button onClick={() => setShowPostForm(true)} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-sm transition-all hover:-translate-y-0.5">
              + Post Team Request
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            {myTeam && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">My Team</h2>
                    <p className="text-sm text-gray-500">{myTeam.teamName || 'Untitled Team'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTeamOwner && myTeam.status === 'open' ? (
                      <div className="flex gap-1 text-gray-500">
                        <button onClick={() => alert('Editing will be supported in the future.')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition" title="Edit Team Request">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteTeamRequest(myTeam._id || myTeam.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition" title="Delete Team Request">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : isTeamOwner && myTeam.status !== 'open' ? (
                      <div className="flex items-center gap-1 text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium" title="Recruitment Locked">
                        <Lock size={10} />
                        Locked
                      </div>
                    ) : null}
                    <div className={`px-2 py-1 text-white text-[10px] rounded font-bold uppercase ${
                      myTeam.status === 'full' ? 'bg-red-500' :
                      myTeam.status === 'registered' ? 'bg-indigo-500' :
                      myTeam.status === 'team_formed' ? 'bg-purple-500' :
                      myTeam.status === 'recruiting' ? 'bg-blue-500' :
                      myTeam.status === 'closed' ? 'bg-gray-500' :
                      'bg-green-500'
                    }`}>
                      {myTeam.status === 'team_formed' ? 'Formed' : myTeam.status}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">L</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Team Lead</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold uppercase">Lead</span>
                  </div>
                  {(myTeam.currentMembers || []).map((m, idx) => m && (
                    <div key={m.id || idx} className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {String(m.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{String(m.name || 'Unknown')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {isTeamOwner && myTeam.status !== 'full' && pendingInbox.length > 0 && (
                  <button onClick={() => setShowInbox(!showInbox)} className="w-full py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-bold hover:bg-yellow-100 transition-colors">
                    {showInbox ? 'Hide Requests' : `View Join Requests (${pendingInbox.length})`}
                  </button>
                )}
              </div>
            )}

            {showInbox && pendingInbox.length > 0 && (
              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6 shadow-sm">
                <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2 text-lg"><Bell size={20} /> Inbox ({pendingInbox.length})</h3>
                <div className="space-y-4">
                  {pendingInbox.map(jr => (
                    <div key={jr._id} className="bg-white border rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-gray-900">{jr.sender?.name}</p>
                          <p className="text-sm text-gray-600 italic mt-1">"{jr.message || 'No message'}"</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-sm border mb-4">
                        <div className="space-y-2 mb-3">
                          {jr.githubLink && <div className="truncate"><span className="font-semibold text-gray-500 mr-2">GitHub:</span><a href={jr.githubLink} target="_blank" className="text-primary-600 hover:underline">{jr.githubLink}</a></div>}
                          {jr.portfolioLink && <div className="truncate"><span className="font-semibold text-gray-500 mr-2">Portfolio:</span><a href={jr.portfolioLink} target="_blank" className="text-primary-600 hover:underline">{jr.portfolioLink}</a></div>}
                          {jr.linkedinLink && <div className="truncate"><span className="font-semibold text-gray-500 mr-2">LinkedIn:</span><a href={jr.linkedinLink} target="_blank" className="text-primary-600 hover:underline">{jr.linkedinLink}</a></div>}
                        </div>
                        {jr.sender?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                            <span className="font-semibold text-gray-500 mr-1 text-xs">Skills:</span>
                            {jr.sender.skills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => store.acceptJoinRequest?.(jr._id)} className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700">Accept</button>
                        <button onClick={() => store.rejectJoinRequest?.(jr._id)} className="flex-1 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-200 hover:bg-red-100">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Filter size={18} /> Filters</h3>
              
              <div className="mb-5">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search keywords..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Role</label>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">All Roles</option>
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Skill</label>
                <select 
                  value={skillFilter} 
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">All Skills</option>
                  {SKILLS.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                </select>
              </div>
              
              {(searchQuery || roleFilter || skillFilter) && (
                <button 
                  onClick={() => { setSearchQuery(''); setRoleFilter(''); setSkillFilter(''); }}
                  className="w-full mt-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Open Requests ({filteredRequests.length})</h3>
            
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed rounded-2xl">
                  <p className="text-gray-500 mb-2">No active team requests match your filters.</p>
                  <button onClick={() => { setSearchQuery(''); setRoleFilter(''); setSkillFilter(''); }} className="text-primary-600 hover:underline font-medium">Clear all filters</button>
                </div>
              ) : filteredRequests.map(req => {
                const memberCount = (req.currentMembers || []).length + 1;
                const reqTeamSizeLimit = req.teamSizeLimit || hMaxTeamSize;
                const isOwner = user?.id && req.createdBy && String(req.createdBy) === String(user.id)
                const isMember = user?.id && (req.currentMembers || []).some(m => m && String(m.id || m._id || '') === String(user.id))
                const myJR = user?.id && myJoinReqs.find(j => String(j.teamRequestId) === String(req._id) || String(j.teamRequestId) === String(req.id))

                return (
                  <div key={req._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{String(req.teamName || req.title || 'Unnamed Team')}</h3>
                        <p className="text-sm font-semibold text-primary-600 mt-1">{memberCount} / {reqTeamSizeLimit} Members</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-5 leading-relaxed">{String(req.description)}</p>

                    <div className="space-y-4 mb-6">
                      {req.requiredRoles?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Roles Needed</p>
                          <div className="flex flex-wrap gap-2">
                            {req.requiredRoles.map((r, idx) => (
                              <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100">
                                {r.role} ({r.count})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {req.requiredSkills?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Skills Preferred</p>
                          <div className="flex flex-wrap gap-2">
                            {req.requiredSkills.map((s, idx) => (
                              <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <span className="text-sm text-gray-500 font-medium">Posted recently</span>
                      
                      {isOwner ? <span className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm">Your Post</span> :
                       isMember ? <span className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-bold rounded-xl text-sm">✓ You are in this team</span> :
                       myJR ? <span className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold rounded-xl text-sm">⏳ Request {myJR.status}</span> :
                       <div className="flex flex-col gap-2 w-full sm:w-auto">
                         {!joinForm[req._id] ? (
                           <button onClick={() => toggleJoinForm(req._id)} className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm">Request to Join</button>
                         ) : (
                           <div className="bg-gray-50 border rounded-xl p-5 w-full sm:w-[400px]">
                             <div className="flex justify-between items-center mb-4">
                               <h4 className="font-bold text-gray-900">Complete Application</h4>
                               <button onClick={() => toggleJoinForm(req._id)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                             </div>
                             
                             <div className="space-y-3 mb-4">
                               <div>
                                 <label className="block text-xs font-bold text-gray-600 mb-1">GitHub URL <span className="text-red-500">*</span></label>
                                 <input value={joinDetails[req._id]?.github || ''} onChange={e => updateJoinDetails(req._id, 'github', e.target.value)} placeholder="https://github.com/..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-600 mb-1">Portfolio URL</label>
                                 <input value={joinDetails[req._id]?.portfolio || ''} onChange={e => updateJoinDetails(req._id, 'portfolio', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-600 mb-1">LinkedIn URL</label>
                                 <input value={joinDetails[req._id]?.linkedin || ''} onChange={e => updateJoinDetails(req._id, 'linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-600 mb-1">Message to Lead</label>
                                 <textarea value={joinMsg[req._id] || ''} onChange={e => setJoinMsg(p => ({...p, [req._id]: e.target.value}))} placeholder="Why are you a good fit?" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white" />
                               </div>
                             </div>
                             
                             <button onClick={() => handleSendJoin(req._id, joinDetails[req._id])} disabled={!joinDetails[req._id]?.github} className="w-full py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-400 shadow-sm transition-colors">
                               Submit Application
                             </button>
                           </div>
                         )}
                       </div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showPostForm && (
        <PostRequestModal
          hMaxTeamSize={hMaxTeamSize}
          onClose={() => setShowPostForm(false)}
          onSubmit={(data) => {
            store.addTeamRequest({ ...data, hackathonId: h.id, createdBy: user.id })
            addNotification({ title: 'Request Posted', message: 'Your team request is live!', priority: 'medium' })
            setShowPostForm(false)
          }}
        />
      )}
    </div>
  )
}

function PostRequestModal({ onClose, onSubmit, hMaxTeamSize }) {
  const [form, setForm] = useState({
    teamName: '',
    description: '',
    requiredRoles: [],
    requiredSkills: [],
    preferredExperienceLevel: '',
    teamSizeLimit: hMaxTeamSize || 4
  })
  
  const [skillSearch, setSkillSearch] = useState('')
  const [roleSearch, setRoleSearch] = useState('')

  const availableSlots = form.teamSizeLimit - 1; // 1 slot for lead
  const requestedMembersCount = form.requiredRoles.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);

  const toggleRole = (role) => {
    setForm(prev => {
      const exists = prev.requiredRoles.find(r => r.role === role)
      if (exists) {
        return { ...prev, requiredRoles: prev.requiredRoles.filter(r => r.role !== role) }
      }
      return { ...prev, requiredRoles: [...prev.requiredRoles, { role, count: 1 }] }
    })
  }

  const updateRoleCount = (role, countStr) => {
    const count = parseInt(countStr) || 1;
    setForm(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.map(r => r.role === role ? { ...r, count } : r)
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

  const handleSubmit = () => {
    if (!form.teamName.trim()) {
      alert("Team Name is required.");
      return;
    }
    if (form.requiredRoles.length === 0) {
      alert("Please select at least one role.");
      return;
    }
    if (requestedMembersCount > availableSlots) {
      alert(`You can request a maximum of ${availableSlots} members based on your team size limit.`);
      return;
    }
    if (!form.description.trim()) {
      alert("Description is required.");
      return;
    }
    
    onSubmit({
      ...form,
      roles: form.requiredRoles, // map to backend payload expectation if needed
      skills: form.requiredSkills
    });
  }

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))
  const filteredSkills = SKILLS.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b shrink-0 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Post Team Request</h2>
            <p className="text-sm text-gray-500 mt-1">Define who you need to build something great.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Section 1: Team Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-700 border-b pb-2">1. Team Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.teamName}
                  onChange={e => setForm({ ...form, teamName: e.target.value })}
                  placeholder="e.g. Code Wizards"
                  className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Size Limit <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="2"
                  max={hMaxTeamSize}
                  value={form.teamSizeLimit}
                  onChange={e => setForm({ ...form, teamSizeLimit: Math.min(parseInt(e.target.value) || 2, hMaxTeamSize) })}
                  className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Max allowed for this event is {hMaxTeamSize}.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Recruitment Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-700 border-b pb-2">2. Recruitment Requirements</h3>
            
            <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between text-sm">
              <span className="font-medium text-blue-900">Total members requested: <strong>{requestedMembersCount}</strong></span>
              <span className="font-medium text-blue-900">Available slots: <strong>{availableSlots}</strong></span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Roles Needed <span className="text-red-500">*</span></label>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search roles..." 
                  value={roleSearch}
                  onChange={e => setRoleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="border rounded-xl p-3 max-h-48 overflow-y-auto bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredRoles.map(role => {
                  const active = form.requiredRoles.find(r => r.role === role)
                  return (
                    <div key={role} className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${active ? 'bg-white border-primary-500 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}>
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input 
                          type="checkbox" 
                          checked={!!active}
                          onChange={() => toggleRole(role)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{role}</span>
                      </label>
                      {active && (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">Count:</span>
                          <input
                            type="number"
                            min="1"
                            max={availableSlots}
                            value={active.count}
                            onChange={e => updateRoleCount(role, e.target.value)}
                            className="w-12 px-1 py-1 text-center border rounded text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Skills Needed <span className="text-gray-400 font-normal">(Optional)</span></label>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search skills..." 
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              
              {form.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  {form.requiredSkills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                      {skill}
                      <button onClick={() => toggleSkill(skill)} className="hover:text-purple-200"><X size={12}/></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {filteredSkills.filter(s => !form.requiredSkills.includes(s)).map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border bg-white text-gray-600 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Experience Level <span className="text-gray-400 font-normal">(Optional)</span></label>
              <select
                value={form.preferredExperienceLevel}
                onChange={e => setForm({ ...form, preferredExperienceLevel: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
              >
                <option value="">Any Level</option>
                <option value="Beginner">Beginner (1st/2nd Year)</option>
                <option value="Intermediate">Intermediate (3rd Year)</option>
                <option value="Advanced">Advanced (4th Year / Pros)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-700 border-b pb-2">3. Description</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Project Details & Responsibilities <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What are you building? What will the new members do? What are the expectations?"
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none text-gray-900"
                required
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t shrink-0 bg-gray-50">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
          >
            Post Team Request
          </button>
        </div>
      </div>
    </div>
  )
}
