import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import ExportButton from '../components/ExportButton'
import ImageViewer from '../components/ImageViewer'
import { format, isPast } from 'date-fns'
import axios from 'axios'
import { 
  ArrowLeft, MapPin, Calendar, Users, Clock, Tag, Shield, Building2, 
  Image as ImageIcon, FileText, Download, Eye, Edit, Trash2, CheckCircle, 
  Activity, BarChart2, Mail, Phone, User, Award, List, ExternalLink 
} from 'lucide-react'

export default function AdminEventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const { eventRegistrations, fetchEventRegistrations, isLoading: regsLoading } = useRegistrationStore()
  
  const [event, setEvent] = useState(null)
  const [organizer, setOrganizer] = useState(null)
  const [viewerImages, setViewerImages] = useState(null)
  const [viewerIndex, setViewerIndex] = useState(0)

  console.log("[AdminEventDetailsPage] mounted");
  console.log("[AdminEventDetailsPage] params", useParams());
  console.log("[AdminEventDetailsPage] event", event);

  useEffect(() => {
    console.log("[AdminEventDetailsPage] useEffect (fetchEvents)");
    if (!events.length) fetchEvents()
  }, [events.length, fetchEvents])

  useEffect(() => {
    console.log("[AdminEventDetailsPage] useEffect (findEvent)", { eventsLength: events.length, id });
    if (events.length > 0) {
      const foundEvent = events.find(e => e._id === id || e.id === id)
      setEvent(foundEvent)
    }
  }, [events, id])

  useEffect(() => {
    console.log("[AdminEventDetailsPage] useEffect (fetchRegistrations)", { id });
    if (id) fetchEventRegistrations(id)
  }, [id, fetchEventRegistrations])

  useEffect(() => {
    if (event?.clubName) {
      axios.get('https://college-connect-campus.onrender.com/api/auth/club-heads')
        .then(res => {
          const heads = res.data.clubHeads || []
          const found = heads.find(h => (h.clubName || '').toLowerCase() === event.clubName.toLowerCase())
          setOrganizer(found)
        })
        .catch(err => console.error(err))
    }
  }, [event])

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  // --- Statistics Computations ---
  const isTeamEvent = event.participationType === 'Team'
  let totalParticipants = 0
  let registeredTeams = 0
  let individualRegs = 0

  eventRegistrations.forEach(reg => {
    if (reg.participationType === 'Team' && reg.teamId) {
      registeredTeams++
      totalParticipants += 1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0)
    } else {
      individualRegs++
      totalParticipants++
    }
  })

  const capacity = event.maxParticipants || event.capacity || 0
  const occupancyPercentage = capacity > 0 ? Math.min(100, Math.round((totalParticipants / capacity) * 100)) : 0
  const remainingSeats = capacity > 0 ? Math.max(0, capacity - totalParticipants) : 'Unlimited'
  const avgTeamSize = registeredTeams > 0 ? (totalParticipants / registeredTeams).toFixed(1) : 0

  // --- Timeline ---
  const timeline = []
  if (event.createdAt) {
    timeline.push({ title: 'Event Created', date: new Date(event.createdAt) })
    timeline.push({ title: 'Submitted for Approval', date: new Date(event.createdAt) })
  }
  if (event.status === 'approved' && event.updatedAt) {
    timeline.push({ title: 'Approved', date: new Date(event.updatedAt) })
    timeline.push({ title: 'Registration Open', date: new Date(event.updatedAt || event.createdAt) })
  }
  if (event.registrationDeadlineDate) {
    timeline.push({ title: 'Registration Closed', date: new Date(event.registrationDeadlineDate) })
  }
  if (event.startDate || event.date) {
    timeline.push({ title: 'Event Started', date: new Date(event.startDate || event.date) })
  }
  if (event.endDate) {
    timeline.push({ title: 'Event Completed', date: new Date(event.endDate) })
  }
  timeline.sort((a,b) => b.date - a.date)

  // --- Export Data ---
  const exportData = [
    { Section: "Event Info", Key: "Title", Value: event.title },
    { Section: "Event Info", Key: "Category", Value: event.category },
    { Section: "Event Info", Key: "Status", Value: event.status },
    { Section: "Event Info", Key: "Date", Value: event.startDate ? new Date(event.startDate).toLocaleDateString() : (event.date ? new Date(event.date).toLocaleDateString() : 'N/A') },
    
    { Section: "Organizer", Key: "Club", Value: event.clubName },
    { Section: "Organizer", Key: "Head", Value: organizer?.name || 'N/A' },
    { Section: "Organizer", Key: "Email", Value: organizer?.email || 'N/A' },
    { Section: "Organizer", Key: "Phone", Value: organizer?.phone || organizer?.contactNumber || 'N/A' },
    
    { Section: "Statistics", Key: "Total Registrations", Value: eventRegistrations.length },
    { Section: "Statistics", Key: "Total Participants", Value: totalParticipants },
    { Section: "Statistics", Key: "Registered Teams", Value: registeredTeams },
    { Section: "Statistics", Key: "Individual Regs", Value: individualRegs },
    { Section: "Statistics", Key: "Capacity", Value: capacity || 'Unlimited' },
    { Section: "Statistics", Key: "Occupancy %", Value: `${occupancyPercentage}%` },
    
    ...timeline.map(t => ({ Section: "Timeline", Key: t.title, Value: new Date(t.date).toLocaleString() })),
    
    ...eventRegistrations.map(reg => {
      const isTeam = reg.participationType === 'Team' && reg.teamId
      return {
        Section: "Registration",
        Key: isTeam ? (reg.teamId.teamName || reg.teamId.title || 'Team') : (reg.studentId?.name || reg.formData?.name || 'N/A'),
        Value: `Type: ${reg.participationType} | Contact: ${isTeam ? reg.teamId.createdBy?.email : (reg.studentId?.email || reg.formData?.email)} | Size: ${isTeam ? (1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0)) : 1}`
      }
    })
  ]

  const openImageViewer = (images, index) => {
    setViewerImages(images)
    setViewerIndex(index)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      {/* 1. EVENT BANNER */}
      <div className="w-full bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200 group cursor-pointer" 
               onClick={() => event.bannerImage && openImageViewer([event.bannerImage], 0)}>
            {event.bannerImage ? (
              <img src={event.bannerImage} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <p className="font-medium">No Banner Image</p>
              </div>
            )}
            {event.bannerImage && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* 3. EVENT DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.status === 'approved' ? 'bg-green-100 text-green-700' :
                  event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {event.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-700">
                  {event.category}
                </span>
                {event.mode && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                    {event.mode}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              <div className="prose max-w-none text-gray-700 mb-8 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Comprehensive Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Start Date & Time</span>
                  <span className="font-medium text-gray-900">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString() : (event.date ? new Date(event.date).toLocaleDateString() : 'TBA')}
                    {event.startTime ? ` • ${event.startTime}` : ''}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">End Date & Time</span>
                  <span className="font-medium text-gray-900">
                    {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBA'}
                    {event.endTime ? ` • ${event.endTime}` : ''}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Registration Deadline</span>
                  <span className="font-medium text-red-600 flex items-center gap-1">
                    <Clock size={14} /> {event.registrationDeadlineDate ? new Date(event.registrationDeadlineDate).toLocaleDateString() : 'TBA'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Location</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" /> {event.location || 'TBA'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Eligibility</span>
                  <span className="font-medium text-gray-900">{event.eligibility || 'Open to all'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Participation Type</span>
                  <span className="font-medium text-gray-900">{event.participationType}</span>
                </div>
                {isTeamEvent && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Min Team Size</span>
                      <span className="font-medium text-gray-900">{event.minTeamSize || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Max Team Size</span>
                      <span className="font-medium text-gray-900">{event.maxTeamSize || 'N/A'}</span>
                    </div>
                  </>
                )}
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Prize Pool</span>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <Award size={14} /> {event.prizePool || 'None'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Max Participants</span>
                  <span className="font-medium text-gray-900">{capacity || 'Unlimited'}</span>
                </div>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Tag size={14}/> Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((t, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 8. PROBLEM STATEMENT */}
            {event.problemStatementPdf && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Problem Statement</h3>
                    <p className="text-xs text-gray-500 mt-1">PDF Document Attached</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={event.problemStatementPdf} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                    <Eye size={16} /> View
                  </a>
                  <a href={event.problemStatementPdf} download className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                    <Download size={16} /> Download
                  </a>
                </div>
              </div>
            )}

            {/* 9. GALLERY */}
            {event.additionalImages && event.additionalImages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-primary-500"/> Event Gallery</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {event.additionalImages.map((img, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl cursor-pointer shadow-sm border border-gray-200 aspect-square" onClick={() => openImageViewer(event.additionalImages, idx)}>
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. REGISTRATION TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><List size={20} className="text-primary-500"/> Registration Table</h2>
              </div>
              
              {regsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading registrations...</div>
              ) : eventRegistrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">No registrations found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Team / Participant</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Members</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Dept</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {eventRegistrations.map(reg => {
                        const isTeam = reg.participationType === 'Team' && reg.teamId
                        const name = isTeam ? (reg.teamId.teamName || reg.teamId.title || 'Team') : (reg.studentId?.name || reg.formData?.name || 'Unknown')
                        const email = isTeam ? (reg.teamId.createdBy?.email || 'N/A') : (reg.studentId?.email || reg.formData?.email || 'N/A')
                        const dept = isTeam ? (reg.teamId.createdBy?.department || 'N/A') : (reg.studentId?.department || reg.formData?.department || 'N/A')
                        const size = isTeam ? (1 + (reg.teamId.currentMembers?.length || 0) + (reg.teamId.offlineMembers?.length || 0)) : 1
                        
                        return (
                          <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900">{name}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isTeam ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                {reg.participationType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900 font-medium text-sm text-center">{size}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{dept}</td>
                            <td className="px-4 py-3 text-gray-500 text-sm">{new Date(reg.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                                Confirmed
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isTeam ? (
                                <button className="text-primary-600 hover:text-primary-800 text-sm font-semibold flex items-center justify-end gap-1 ml-auto">
                                  View Team <ExternalLink size={14} />
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            
            {/* 11. ADMIN ACTIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Administrative Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition flex items-center justify-between group border border-gray-200">
                  <span className="flex items-center gap-2"><Edit size={16} className="text-gray-500 group-hover:text-primary-600 transition" /> Edit Event</span>
                </button>
                <button className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl transition flex items-center justify-between group border border-red-100">
                  <span className="flex items-center gap-2"><Trash2 size={16} /> Archive Event</span>
                </button>
                
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Export Data</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <ExportButton data={exportData} filename={`${event.title}_Full_Report`} type="csv" />
                    </div>
                    <div className="flex-1">
                      <ExportButton data={exportData} filename={`${event.title}_Full_Report`} type="pdf" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CAPACITY CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users size={100} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Activity size={18} className="text-primary-500"/> Capacity Status</h2>
              
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalParticipants}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">Total Participants</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-700 leading-none">{capacity || '∞'}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">Maximum Capacity</p>
                </div>
              </div>

              {capacity > 0 && (
                <>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden mt-4 shadow-inner">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${occupancyPercentage > 90 ? 'bg-red-500' : occupancyPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${occupancyPercentage}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
                    <span>{occupancyPercentage}% Occupied</span>
                    <span>{remainingSeats} Seats Remaining</span>
                  </div>
                </>
              )}
            </div>

            {/* 6. REGISTRATION ANALYTICS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2"><BarChart2 size={18} className="text-primary-500"/> Registration Analytics</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium text-sm flex items-center gap-2"><FileText size={14}/> Total Registrations</span>
                  <span className="font-bold text-gray-900">{eventRegistrations.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium text-sm flex items-center gap-2"><Users size={14}/> Total Participants</span>
                  <span className="font-bold text-gray-900">{totalParticipants}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-medium text-sm flex items-center gap-2"><User size={14}/> Individual Regs</span>
                  <span className="font-bold text-blue-800">{individualRegs}</span>
                </div>
                {isTeamEvent && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-purple-700 font-medium text-sm flex items-center gap-2"><Users size={14}/> Registered Teams</span>
                      <span className="font-bold text-purple-800">{registeredTeams}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-600 font-medium text-sm">Avg Team Size</span>
                      <span className="font-bold text-gray-900">{avgTeamSize}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. ORGANIZER INFORMATION */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Shield size={80} />
              </div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2"><Shield size={18} className="text-primary-400"/> Organizer Info</h2>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Club</p>
                  <p className="font-bold text-lg">{event.clubName}</p>
                </div>
                
                {organizer && (
                  <>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Club Head</p>
                      <p className="font-medium text-white flex items-center gap-2"><User size={14} className="text-primary-400"/> {organizer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Department</p>
                      <p className="font-medium text-white flex items-center gap-2"><Building2 size={14} className="text-primary-400"/> {organizer.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Contact</p>
                      <p className="text-sm text-gray-300 flex items-center gap-2 mb-1"><Mail size={14} className="text-primary-400"/> {organizer.email}</p>
                      {(organizer.phone || organizer.contactNumber) && (
                        <p className="text-sm text-gray-300 flex items-center gap-2"><Phone size={14} className="text-primary-400"/> {organizer.phone || organizer.contactNumber}</p>
                      )}
                    </div>
                  </>
                )}
                {!organizer && (
                  <p className="text-sm text-gray-400 italic">Organizer details not found in current schema.</p>
                )}
              </div>
            </div>

            {/* 7. EVENT TIMELINE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Event Timeline</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-100 text-primary-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                        <span className="text-xs text-gray-500 mt-1">{format(item.date, 'MMM dd, yyyy • hh:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

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
