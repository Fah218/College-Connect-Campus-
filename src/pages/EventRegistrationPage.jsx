import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import { useHackathonStore } from '../store/hackathonStore'
import Navbar from '../components/Navbar'
import { Calendar, MapPin, Users, CheckCircle, Search, PlusCircle, ShieldAlert, Trash2, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import axios from 'axios'

export default function EventRegistrationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { events, isLoading } = useEventStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()
  const { registerIndividual, registerTeam, registrations, fetchStudentRegistrations } = useRegistrationStore()
  const { teamRequests, fetchHackathonData } = useHackathonStore()
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState(null)
  
  const [showAddInline, setShowAddInline] = useState(false)
  const [inlineMember, setInlineMember] = useState({ name: '', email: '', phone: '', department: '', year: '' })
  
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [editMemberData, setEditMemberData] = useState({ name: '', email: '', phone: '' })
  
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
    members: []
  })
  
  const addOfflineMember = () => {
    setOfflineTeamData({
      ...offlineTeamData,
      members: [...offlineTeamData.members, { name: '', email: '', phone: '', department: '', year: '' }]
    })
  }

  const removeOfflineMember = (index) => {
    const newMembers = [...offlineTeamData.members]
    newMembers.splice(index, 1)
    setOfflineTeamData({ ...offlineTeamData, members: newMembers })
  }

  const updateOfflineMember = (index, field, value) => {
    const newMembers = [...offlineTeamData.members]
    newMembers[index][field] = value
    setOfflineTeamData({ ...offlineTeamData, members: newMembers })
  }
  
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

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchStudentRegistrations(user.id || user._id)
    }
  }, [user])

  if (!event) return <div>Event not found</div>

  const isApproved = event.status === 'approved'
  const isPastDeadline = new Date(`${event.registrationDeadlineDate}T${event.registrationDeadlineTime}`) < new Date()

  const isHackathon = event.category === 'Hackathon';
  const isIndividualHackathon = event.teamSizeMin === 1 && event.maxTeamSize === 1;
  const isTeamHackathon = event.maxTeamSize > 1;

  // Find user's team for this event
  const myTeam = teamRequests?.find(tr => {
    const isOwner = String(tr.createdBy) === String(user?.id || user?._id);
    const isMember = (tr.currentMembers || []).some(m => String(m.id || m._id || m) === String(user?.id || user?._id));
    return String(tr.hackathonId) === String(event.id || event._id) && (isOwner || isMember);
  });

  const isTeamLead = myTeam && String(myTeam.createdBy) === String(user?.id || user?._id);
  const currentTeamSize = myTeam ? 1 + (myTeam.currentMembers?.length || 0) : 0;
  const isTeamSizeValid = myTeam && currentTeamSize >= (event.teamSizeMin || 1) && currentTeamSize <= (event.maxTeamSize || 99);
  
  const isRegisteredBackend = registrations.some(r => {
    if (String(r.eventId?._id || r.eventId) !== String(event?.id || event?._id)) return false;
    if (r.participationType === 'Individual') {
      return String(r.studentId?._id || r.studentId) === String(user?.id || user?._id);
    }
    if (r.participationType === 'Team') {
      if (r.teamId) {
        const isLead = String(r.teamId.createdBy) === String(user?.id || user?._id);
        const isMember = (r.teamId.currentMembers || []).some(m => String(m.id || m._id || m) === String(user?.id || user?._id));
        return isLead || isMember;
      } else if (r.teamDetails) {
        return (r.teamDetails.members || []).some(m => m.email?.toLowerCase() === user?.email?.toLowerCase());
      }
    }
    return false;
  });

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

  const handleAddInlineMember = async () => {
    if (!inlineMember.name.trim() || !inlineMember.email.trim()) {
      return setErrorMsg('Full Name and Email are required.')
    }
    const allEmails = [user?.email, ...(myTeam.currentMembers || []).map(m => m.email), inlineMember.email].map(e => (e || '').toLowerCase().trim())
    const uniqueEmails = new Set(allEmails)
    if (uniqueEmails.size !== allEmails.length) {
      return setErrorMsg('Duplicate emails are not allowed.')
    }
    
    setLoading(true)
    setErrorMsg('')
    try {
      const newMember = {
        id: `offline_${inlineMember.email.trim()}`,
        name: inlineMember.name.trim(),
        email: inlineMember.email.trim(),
        phone: inlineMember.phone.trim() || undefined,
        joinedVia: 'offline'
      }
      
      await axios.put(`http://localhost:5001/api/teams/request/${myTeam._id || myTeam.id}`, {
        currentMembers: [...(myTeam.currentMembers || []), newMember]
      })
      await fetchHackathonData()
      setInlineMember({ name: '', email: '', phone: '' })
      setShowAddInline(false)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const updatedMembers = (myTeam.currentMembers || []).filter(m => m.id !== memberId && m._id !== memberId)
      await axios.put(`http://localhost:5001/api/teams/request/${myTeam._id || myTeam.id}`, {
        currentMembers: updatedMembers
      })
      await fetchHackathonData()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEditMember = async (memberId) => {
    if (!editMemberData.name.trim() || !editMemberData.email.trim()) {
      return setErrorMsg('Full Name and Email are required.')
    }
    
    // Check duplicates, excluding the current member being edited
    const otherEmails = [user?.email, ...(myTeam.currentMembers || []).filter(m => m.id !== memberId && m._id !== memberId).map(m => m.email)].map(e => (e || '').toLowerCase().trim())
    if (otherEmails.includes(editMemberData.email.toLowerCase().trim())) {
      return setErrorMsg('Duplicate emails are not allowed.')
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const updatedMembers = (myTeam.currentMembers || []).map(m => {
        if (m.id === memberId || m._id === memberId) {
          return {
            ...m,
            name: editMemberData.name.trim(),
            email: editMemberData.email.trim(),
            phone: editMemberData.phone.trim() || undefined
          }
        }
        return m
      })
      
      await axios.put(`http://localhost:5001/api/teams/request/${myTeam._id || myTeam.id}`, {
        currentMembers: updatedMembers
      })
      await fetchHackathonData()
      setEditingMemberId(null)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update member')
    } finally {
      setLoading(false)
    }
  }

  const handleNonHackathonTeamRegistration = async (e) => {
    e.preventDefault();
    const totalSize = 1 + offlineTeamData.members.length;
    if (totalSize < (event.teamSizeMin || 1) || totalSize > (event.maxTeamSize || 99)) {
      return setErrorMsg(`Team size must be between ${event.teamSizeMin || 1} and ${event.maxTeamSize || 'Unlimited'}.`);
    }

    const allEmails = [user?.email, ...offlineTeamData.members.map(m => m.email)].map(e => (e || '').toLowerCase().trim());
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.length) {
      return setErrorMsg('Duplicate emails are not allowed, and members cannot use the Team Lead\'s email.');
    }

    for (const m of offlineTeamData.members) {
      if (!m.name.trim() || !m.email.trim() || !m.phone.trim() || !m.department.trim() || !m.year.trim()) {
        return setErrorMsg('All members must have Full Name, Email, Phone, Department, and Year filled out.');
      }
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const leader = {
        name: user?.name,
        email: user?.email,
        phone: formData.phone || user?.phone || '',
        department: formData.department || user?.department || '',
        year: formData.year || user?.year || '',
        role: 'Leader'
      };

      const members = offlineTeamData.members.map(m => ({
        name: m.name.trim(),
        email: m.email.trim(),
        phone: m.phone.trim(),
        department: m.department.trim(),
        year: m.year.trim(),
        role: 'Member'
      }));

      const teamDetails = {
        teamName: offlineTeamData.title.trim(),
        members: [leader, ...members]
      };

      await registerTeam(event.id || event._id, null, user?.id || user?._id, teamDetails);
      setSuccess(true);
      setTimeout(() => navigate('/student-dashboard'), 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to register team');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfflineTeam = async (e) => {
    e.preventDefault()
    
    // Validate team size
    const totalSize = 1 + offlineTeamData.members.length;
    if (totalSize < (event.teamSizeMin || 1) || totalSize > (event.maxTeamSize || 99)) {
      return setErrorMsg(`Team size must be between ${event.teamSizeMin || 1} and ${event.maxTeamSize || 'Unlimited'}.`);
    }

    // Validate emails
    const allEmails = [user?.email, ...offlineTeamData.members.map(m => m.email)].map(e => (e || '').toLowerCase().trim());
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.length) {
      return setErrorMsg('Duplicate emails are not allowed, and members cannot use the Team Lead\'s email.');
    }

    // Validate required fields
    for (const m of offlineTeamData.members) {
      if (!m.name.trim() || !m.email.trim()) {
        return setErrorMsg('All members must have a Full Name and Email.');
      }
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const currentMembers = offlineTeamData.members.map(m => ({ 
        id: `offline_${m.email.trim()}`, 
        email: m.email.trim(), 
        name: m.name.trim(),
        phone: m.phone.trim() || undefined,
        joinedVia: 'offline'
      }))
      
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
  

  const hackathonLayout = (
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
              isTeamHackathon ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isTeamHackathon ? 'Team' : 'Individual'} Registration
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
              {isTeamHackathon && (
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

              {!isHackathon && event.participationType === 'Team' ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Team Registration</h2>
                  <form onSubmit={handleNonHackathonTeamRegistration} className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                      <input type="text" value={offlineTeamData.title} onChange={(e) => setOfflineTeamData({ ...offlineTeamData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" required placeholder="e.g. The Innovators" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Team Leader</h3>
                      <div className="p-4 bg-gray-50 border rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                          <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                          <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                          <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                          <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                        <p className="text-sm text-gray-500">Size: {offlineTeamData.members.length + 1} / {event.maxTeamSize}</p>
                      </div>
                      
                      {offlineTeamData.members.map((member, index) => (
                        <div key={index} className="p-4 border rounded-xl relative bg-white">
                          <button type="button" onClick={() => removeOfflineMember(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                          <h4 className="font-semibold text-sm mb-3">Member {index + 1}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                              <input type="text" value={member.name} onChange={(e) => updateOfflineMember(index, 'name', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                              <input type="email" value={member.email} onChange={(e) => updateOfflineMember(index, 'email', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone <span className="text-red-500">*</span></label>
                              <input type="tel" value={member.phone} onChange={(e) => updateOfflineMember(index, 'phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
                              <input type="text" value={member.department} onChange={(e) => updateOfflineMember(index, 'department', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Year <span className="text-red-500">*</span></label>
                              <input type="text" value={member.year} onChange={(e) => updateOfflineMember(index, 'year', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                          </div>
                        </div>
                      ))}

                      {offlineTeamData.members.length + 1 < (event.maxTeamSize || 99) && (
                        <button type="button" onClick={addOfflineMember} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                          <PlusCircle size={20} />
                          Add Team Member
                        </button>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <button type="submit" disabled={loading || !isApproved || isPastDeadline || offlineTeamData.members.length + 1 < (event.teamSizeMin || 1)} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Registering...' : 'Register Team'}
                      </button>
                      {offlineTeamData.members.length + 1 < (event.teamSizeMin || 1) && (
                        <p className="text-red-500 text-sm text-center mt-2">You need at least {event.teamSizeMin} members to register.</p>
                      )}
                    </div>
                  </form>
                </>
              ) : isIndividualHackathon ? (
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
                          <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-medium">{user?.name} <span className="text-xs ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded">Team Lead</span></span>
                              <span className="text-xs text-gray-500">{user?.email}</span>
                            </div>
                          </div>
                          {(myTeam.currentMembers || []).map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                              {editingMemberId === (m.id || m._id) ? (
                                <div className="w-full">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                    <div>
                                      <input type="text" value={editMemberData.name} onChange={(e) => setEditMemberData({...editMemberData, name: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500" placeholder="Full Name" />
                                    </div>
                                    <div>
                                      <input type="email" value={editMemberData.email} onChange={(e) => setEditMemberData({...editMemberData, email: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500" placeholder="Email" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <input type="tel" value={editMemberData.phone} onChange={(e) => setEditMemberData({...editMemberData, phone: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500" placeholder="Phone (Optional)" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => handleSaveEditMember(m.id || m._id)} disabled={loading} className="px-3 py-1 bg-primary-600 text-white rounded text-xs font-bold hover:bg-primary-700 disabled:opacity-50">Save</button>
                                    <button type="button" onClick={() => setEditingMemberId(null)} disabled={loading} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium">{m.name || 'Member'}</span>
                                    <span className="text-xs text-gray-500">{m.email}</span>
                                    {m.phone && <span className="text-xs text-gray-400">{m.phone}</span>}
                                  </div>
                                  {isTeamLead && !isRegisteredBackend && (
                                    <div className="flex items-center gap-1">
                                      <button type="button" onClick={() => { setEditingMemberId(m.id || m._id); setEditMemberData({ name: m.name || '', email: m.email || '', phone: m.phone || '' }) }} className="text-gray-400 hover:text-primary-600 p-2 rounded hover:bg-primary-50 transition-colors">
                                        <Edit2 size={16} />
                                      </button>
                                      <button type="button" onClick={() => handleRemoveMember(m.id || m._id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                          
                          {isTeamLead && !isRegisteredBackend && currentTeamSize < (event.maxTeamSize || 99) && (
                            <>
                              {!showAddInline ? (
                                <button type="button" onClick={() => setShowAddInline(true)} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                                  <PlusCircle size={18} /> Add Member
                                </button>
                              ) : (
                                <div className="bg-gray-50 border rounded-lg p-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold text-gray-900">Add New Member</span>
                                    <button type="button" onClick={() => setShowAddInline(false)} className="text-gray-400 hover:text-gray-700 text-sm">Cancel</button>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs text-gray-700 mb-1">Full Name *</label>
                                        <input type="text" value={inlineMember.name} onChange={(e) => setInlineMember({...inlineMember, name: e.target.value})} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="John Doe" />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-700 mb-1">Email *</label>
                                        <input type="email" value={inlineMember.email} onChange={(e) => setInlineMember({...inlineMember, email: e.target.value})} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="john@example.com" />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-700 mb-1">Phone Number (Optional)</label>
                                      <input type="tel" value={inlineMember.phone} onChange={(e) => setInlineMember({...inlineMember, phone: e.target.value})} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="+1234567890" />
                                    </div>
                                    <button type="button" onClick={handleAddInlineMember} disabled={loading} className="w-full py-2 bg-primary-600 text-white rounded text-sm font-bold hover:bg-primary-700 disabled:opacity-50">
                                      {loading ? 'Adding...' : 'Save Member'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 space-y-4">
                        {!isTeamSizeValid && !isRegisteredBackend && (
                          <p className="text-red-600 font-medium text-sm text-center">Your team size does not meet the event requirements. Add more members to register.</p>
                        )}
                        {!isTeamLead && !isRegisteredBackend && (
                          <p className="text-gray-500 font-medium text-sm text-center">Only the Team Lead can officially submit the registration for the event.</p>
                        )}
                        {!isRegisteredBackend && (
                          <button 
                            onClick={handleTeamRegisterSubmit}
                            disabled={loading || !isApproved || isPastDeadline || !isTeamSizeValid || !isTeamLead} 
                            className="w-full py-3.5 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Processing...' : 'Register Team'}
                          </button>
                        )}
                        {isRegisteredBackend && (
                          <div className="w-full py-3.5 bg-green-100 text-green-700 border border-green-200 rounded-lg font-bold text-lg text-center flex items-center justify-center gap-2">
                            <CheckCircle size={20} /> Team Officially Registered
                          </div>
                        )}
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
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 border-b pb-2">Team Members</h4>
                              
                              {/* Team Lead Card */}
                              <div className="bg-white border rounded-lg p-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-bl-lg">Team Lead</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                                    <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm cursor-not-allowed" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                                    <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm cursor-not-allowed" />
                                  </div>
                                </div>
                              </div>

                              {/* Dynamic Member Cards */}
                              {offlineTeamData.members.map((member, idx) => (
                                <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700">Member {idx + 1}</span>
                                    <button type="button" onClick={() => removeOfflineMember(idx)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                      <input type="text" required value={member.name} onChange={(e) => updateOfflineMember(idx, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 text-sm" placeholder="John Doe" />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                      <input type="email" required value={member.email} onChange={(e) => updateOfflineMember(idx, 'email', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 text-sm" placeholder="john@example.com" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs text-gray-700 mb-1">Phone Number (Optional)</label>
                                      <input type="tel" value={member.phone} onChange={(e) => updateOfflineMember(idx, 'phone', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 text-sm" placeholder="+1234567890" />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Add Member Button */}
                              {offlineTeamData.members.length + 1 < (event.maxTeamSize || 99) && (
                                <button type="button" onClick={addOfflineMember} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                                  <PlusCircle size={18} /> Add Member
                                </button>
                              )}
                              
                              <p className="text-xs text-gray-500 text-center mt-2">
                                Team Size: {offlineTeamData.members.length + 1} / {event.maxTeamSize || 'Unlimited'} 
                                {event.teamSizeMin > 1 && ` (Min required: ${event.teamSizeMin})`}
                              </p>
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
  );

  const renderRegistrationCard = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">Registration</h3>
        
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isApproved && !isPastDeadline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

      <div className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full ${!event.bannerImage ? 'pt-8' : ''}`}>
        
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
                      <img src={imgUrl} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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

  return isHackathon ? hackathonLayout : nonHackathonLayout;
}
