import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import { useHackathonStore } from '../store/hackathonStore'
import Navbar from '../components/Navbar'
import { Calendar, MapPin, Users, CheckCircle, Search, PlusCircle, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import axios from 'axios'

export default function EventRegistrationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { events } = useEventStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()
  const { registerIndividual, registerTeam } = useRegistrationStore()
  const { teamRequests, fetchHackathonData } = useHackathonStore()
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Individual Form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    year: '',
    expectations: ''
  })

  // Offline Team Form
  const [showOfflineTeamForm, setShowOfflineTeamForm] = useState(false)
  const [offlineTeamData, setOfflineTeamData] = useState({
    title: '',
    memberEmails: ''
  })
  
  const event = events.find(e => String(e.id) === String(id) || String(e._id) === String(id))
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (event?.participationType === 'Team') {
      fetchHackathonData()
    }
  }, [event])

  if (!event) return <div>Event not found</div>

  const isApproved = event.status === 'approved'
  const isPastDeadline = new Date(`${event.registrationDeadlineDate}T${event.registrationDeadlineTime}`) < new Date()

  // Find user's team for this event
  const myTeam = teamRequests?.find(tr => {
    const isOwner = String(tr.createdBy) === String(user?.id || user?._id);
    const isMember = (tr.currentMembers || []).some(m => String(m.id || m._id || m) === String(user?.id || user?._id));
    return String(tr.hackathonId) === String(event.id || event._id) && (isOwner || isMember);
  });

  const isTeamLead = myTeam && String(myTeam.createdBy) === String(user?.id || user?._id);
  const currentTeamSize = myTeam ? 1 + (myTeam.currentMembers?.length || 0) : 0;
  const isTeamSizeValid = myTeam && currentTeamSize >= (event.teamSizeMin || 1) && currentTeamSize <= (event.maxTeamSize || 99);

  const handleIndividualSubmit = async (e) => {
    e.preventDefault()
    if (!isApproved) return setErrorMsg('Cannot register: Event is not approved.')
    if (isPastDeadline) return setErrorMsg('Cannot register: Registration deadline has passed.')

    setLoading(true)
    setErrorMsg('')
    try {
      await registerIndividual(event._id || event.id, formData, user?.id || user?._id)
      setSuccess(true)
      addNotification({ title: 'Registration Successful!', message: `You have been registered for ${event.title}`, priority: 'high' })
      setTimeout(() => navigate('/student'), 2000)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTeamRegisterSubmit = async () => {
    if (!isApproved) return setErrorMsg('Cannot register: Event is not approved.')
    if (isPastDeadline) return setErrorMsg('Cannot register: Registration deadline has passed.')
    if (!isTeamSizeValid) return setErrorMsg(`Team size must be between ${event.teamSizeMin} and ${event.maxTeamSize}.`)

    setLoading(true)
    setErrorMsg('')
    try {
      await registerTeam(event._id || event.id, myTeam._id || myTeam.id, user?.id || user?._id)
      setSuccess(true)
      addNotification({ title: 'Team Registered!', message: `Your team ${myTeam.title || myTeam.teamName} has been registered!`, priority: 'high' })
      setTimeout(() => navigate('/student'), 2000)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOfflineTeam = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const emails = offlineTeamData.memberEmails.split(',').map(e => e.trim()).filter(Boolean)
      const currentMembers = emails.map(email => ({ id: `offline_${email}`, email, name: email.split('@')[0] }))
      
      const payload = {
        hackathonId: event.id || event._id,
        createdBy: user?.id || user?._id,
        title: offlineTeamData.title,
        description: 'Offline Team',
        status: 'closed',
        currentMembers
      }

      await axios.post('http://localhost:5001/api/teams/request', payload)
      await fetchHackathonData()
      setShowOfflineTeamForm(false)
      addNotification({ title: 'Team Created', message: 'Offline team created successfully.', priority: 'success' })
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl shadow-sm border p-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Registration Successful!</h2>
            <p className="text-lg text-gray-600 mb-8">
              You are officially registered for <span className="font-semibold text-gray-900">{event.title}</span>
            </p>
            <p className="text-sm text-gray-500 animate-pulse">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!isApproved && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-3">
            <ShieldAlert size={20} />
            <p className="font-medium">This event is not yet approved. Registration is disabled.</p>
          </div>
        )}

        {isPastDeadline && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-3">
            <Calendar size={20} />
            <p className="font-medium">The registration deadline for this event has passed.</p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8 text-gray-900">Event Registration</h1>
        
        <div className="grid md:grid-cols-5 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
              event.participationType === 'Team' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {event.participationType || 'Individual'} Registration
            </span>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{event.title}</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg text-primary-600"><Calendar size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{format(new Date(event.startDate || event.date || new Date()), 'MMM dd, yyyy')}</p>
                  <p className="text-xs text-gray-500">{event.startTime || event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg text-primary-600"><MapPin size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.location}</p>
                  <p className="text-xs text-gray-500">{event.mode || 'Offline'}</p>
                </div>
              </div>
              {event.participationType === 'Team' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg text-primary-600"><Users size={20} /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Size limits</p>
                    <p className="text-xs text-gray-500">Min: {event.teamSizeMin || 1} | Max: {event.maxTeamSize || 'Unlimited'}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Registration Deadline</h3>
              <p className="text-red-600 font-medium">
                {event.registrationDeadlineDate ? format(new Date(event.registrationDeadlineDate), 'MMMM dd, yyyy') : 'TBA'} at {event.registrationDeadlineTime || '11:59 PM'}
              </p>
            </div>
          </div>
          
          {/* Registration Form / Logic */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
              
              {errorMsg && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-3">
                  <ShieldAlert size={20} className="mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-sm">{errorMsg}</p>
                </div>
              )}

              {event.participationType !== 'Team' ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Applicant Details</h2>
                  <form onSubmit={handleIndividualSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow">
                          <option value="">Select</option>
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button type="submit" disabled={loading || !isApproved || isPastDeadline} className="w-full py-3.5 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Registering...' : 'Complete Registration'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {myTeam ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Team Verification</h2>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-bold">Your Team</p>
                            <h3 className="text-2xl font-bold text-gray-900">{myTeam.title || myTeam.teamName}</h3>
                          </div>
                          <div className={`px-4 py-2 rounded-lg border font-bold text-sm ${isTeamSizeValid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            Size: {currentTeamSize} / {event.maxTeamSize}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="font-semibold text-gray-700 border-b pb-2">Roster</p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 font-medium">Team Creator <span className="text-xs ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded">Lead</span></span>
                          </div>
                          {(myTeam.currentMembers || []).map((m, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-gray-600">{m.name || m.email || 'Member'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-4">
                        {!isTeamSizeValid && (
                          <p className="text-red-600 font-medium text-sm text-center">Your team size does not meet the event requirements. Add more members to register.</p>
                        )}
                        {!isTeamLead && (
                          <p className="text-gray-500 font-medium text-sm text-center">Only the Team Lead can officially submit the registration for the event.</p>
                        )}
                        <button 
                          onClick={handleTeamRegisterSubmit}
                          disabled={loading || !isApproved || isPastDeadline || !isTeamSizeValid || !isTeamLead} 
                          className="w-full py-3.5 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? 'Processing...' : 'Register Team'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 text-center py-6">
                      <Users className="w-16 h-16 text-gray-300 mx-auto" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Required</h2>
                        <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                          You must join or create a team before you can officially register for this hackathon.
                        </p>
                      </div>
                      
                      {!showOfflineTeamForm ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                          <Link to={`/hackathons/${event.id || event._id}`} className="flex flex-col items-center justify-center p-6 border-2 border-primary-100 bg-primary-50 rounded-xl hover:border-primary-500 hover:bg-primary-100 transition-colors group cursor-pointer">
                            <Search className="text-primary-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
                            <span className="font-bold text-primary-900">Find Teammates</span>
                            <span className="text-xs text-primary-600 mt-1">Browse open requests</span>
                          </Link>
                          
                          <div onClick={() => setShowOfflineTeamForm(true)} className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 bg-white rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors group cursor-pointer">
                            <PlusCircle className="text-gray-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
                            <span className="font-bold text-gray-900">Create Team</span>
                            <span className="text-xs text-gray-500 mt-1">I already have a team</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-left bg-gray-50 border rounded-xl p-6 relative">
                          <button onClick={() => setShowOfflineTeamForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-sm font-medium">Cancel</button>
                          <h3 className="text-xl font-bold mb-6 text-gray-900">Create Offline Team</h3>
                          <form onSubmit={handleCreateOfflineTeam} className="space-y-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                              <input type="text" value={offlineTeamData.title} onChange={(e) => setOfflineTeamData({ ...offlineTeamData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" required placeholder="e.g. Code Ninjas" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Member Emails</label>
                              <p className="text-xs text-gray-500 mb-2">Enter the emails of your offline teammates, separated by commas.</p>
                              <textarea value={offlineTeamData.memberEmails} onChange={(e) => setOfflineTeamData({ ...offlineTeamData, memberEmails: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows="3" placeholder="friend1@university.edu, friend2@university.edu" />
                            </div>
                            <button type="submit" disabled={loading || !offlineTeamData.title} className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50">
                              {loading ? 'Creating...' : 'Save & Continue'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
