import { useState, useMemo, useEffect } from 'react'
import { useEventStore } from '../store/eventStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'
import { useClubStore } from '../store/clubStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import Timeline from '../components/Timeline'
import PredictiveInsights from '../components/PredictiveInsights'
import ExportButton from '../components/ExportButton'
import ParticipantsModal from '../components/ParticipantsModal'
import ImageViewer from '../components/ImageViewer'
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, X, Upload, XCircle, Settings, Mail, Bell, Shield, ChevronLeft, ChevronRight, Activity, Image as ImageIcon, Search, CheckCircle, Layout, List, Loader2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'

export default function ClubHeadDashboard() {
  const { events, addEvent, updateEvent, deleteEvent, getEventSummary, uploadProgress } = useEventStore()
    const { addNotification } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('table')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [viewingEvent, setViewingEvent] = useState(null)
  const [viewingParticipants, setViewingParticipants] = useState(null)
  const [viewerImages, setViewerImages] = useState(null)
  const [viewerIndex, setViewerIndex] = useState(0)
  
  const { user } = useAuthStore()
  const { clubHeadAnalytics, fetchClubHeadAnalytics, predictAttendance } = useAnalyticsStore()
  const currentClubName = (user?.clubName || user?.name || 'My Club').trim().toLowerCase()
  
  const { clubs, fetchClubs } = useClubStore()
  useEffect(() => {
    fetchClubs()
  }, [])
  
  const isArchived = useMemo(() => {
    return clubs.some(c => c.clubName && c.clubName.toLowerCase() === currentClubName && c.isArchived)
  }, [clubs, currentClubName])
  
  const myEvents = events.filter(e => {
    const eventClub = (e.club || e.clubName || '').trim().toLowerCase()
    return eventClub === currentClubName
  })
  const pendingEvents = myEvents.filter(e => e.status === 'pending')
  const approvedEvents = myEvents.filter(e => e.status === 'approved')
  
  const handleSubmit = async (formData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id || editingEvent._id, formData)
        addNotification({
          title: 'Event Updated',
          message: `${formData.title} has been updated`,
          priority: 'low'
        })
      } else {
        await addEvent({ ...formData, club: user?.clubName || user?.name || 'My Club' })
        addNotification({
          title: 'Event Created',
          message: `${formData.title} has been submitted for approval`,
          priority: 'medium'
        })
      }
      setShowModal(false)
      setEditingEvent(null)
    } catch (error) {
      addNotification({
        title: 'Error',
        message: error.message || 'Operation failed. Please try again.',
        priority: 'high'
      })
    }
  }
  
  const exportData = myEvents.map(e => ({
    Title: e.title,
    Date: e.date,
    Status: e.status,
    Attendees: e.totalParticipants || 0,
    Capacity: e.capacity
  }))
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard: <span className="text-primary-600 capitalize">{currentClubName}</span></h1>
          <div className="flex gap-2">
            <ExportButton data={exportData} filename="club_events" type="csv" />
          </div>
        </div>

        {isArchived && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
            <Layout className="shrink-0" />
            <div>
              <p className="font-bold">Your club has been archived.</p>
              <p className="text-sm">You can no longer create or edit events. Please contact the administrator for assistance.</p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowModal(true)}
            disabled={isArchived}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition ${isArchived ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Calendar} title="Total Events" value={clubHeadAnalytics?.dashboard?.totalEvents || 0} color="primary" />
          <StatCard icon={CheckCircle} title="Approved" value={clubHeadAnalytics?.dashboard?.approved || 0} color="green" />
          <StatCard icon={Clock} title="Pending Approval" value={clubHeadAnalytics?.dashboard?.pending || 0} color="orange" />
          <StatCard icon={Users} title="Total Attendees" value={clubHeadAnalytics?.dashboard?.totalParticipants || 0} color="purple" />
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${view === 'table' ? 'bg-primary-600 text-white' : 'bg-white border'}`}
          >
            <List size={18} />
            Table View
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${view === 'timeline' ? 'bg-primary-600 text-white' : 'bg-white border'}`}
          >
            <Layout size={18} />
            Timeline View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-white border'}`}
          >
            <Calendar size={18} />
            Calendar View
          </button>
        </div>
        
        {view === 'timeline' ? (
          <Timeline events={myEvents} userRole="club_head" />
        ) : view === 'calendar' ? (
          <CalendarView
            events={myEvents}
            currentDate={calendarDate}
            selectedDay={selectedDay}
            onDayClick={(day) => setSelectedDay(isSameDay(selectedDay, day) ? null : day)}
            onMonthPrev={() => { setCalendarDate(subMonths(calendarDate, 1)); setSelectedDay(null) }}
            onMonthNext={() => { setCalendarDate(addMonths(calendarDate, 1)); setSelectedDay(null) }}
            onEventClick={(evt) => setViewingEvent(evt)}
            onCreateOnDay={(day) => {
              setEditingEvent(null)
              setShowModal(true)
            }}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">My Events</h2>
            </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {myEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{(event.date || event.startDate) && !isNaN(new Date(event.date || event.startDate).getTime()) ? format(new Date(event.date || event.startDate), 'MMM dd, yyyy') : 'Date TBA'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'approved' ? 'bg-green-100 text-green-700' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {event.category === 'Hackathon' || event.participationType === 'Team' ? (
                        <div>
                          <div className="font-medium text-gray-800">{event.teamCount || 0} Teams</div>
                          <div className="text-gray-500 text-xs">{event.totalParticipants || 0} Participants</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-gray-800">{event.individualCount || event.totalParticipants || 0} / {event.maxParticipants || event.capacity || 'Unlimited'}</div>
                          <div className="text-gray-500 text-xs">Registered</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingParticipants(event)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="View Participants"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingEvent(event)
                            setShowModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Event"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}

      {viewingEvent && (
        <EventDetailsModal event={viewingEvent} onClose={() => setViewingEvent(null)} onEdit={(evt) => { setViewingEvent(null); setEditingEvent(evt); setShowModal(true) }} />
      )}

      {viewingParticipants && (
        <ParticipantsModal event={viewingParticipants} onClose={() => setViewingParticipants(null)} />
      )}
      </div>
      
      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowModal(false)
            setEditingEvent(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

// ─── Calendar View Component ─────────────────────────────────────────────────
function CalendarView({ events, currentDate, selectedDay, onDayClick, onMonthPrev, onMonthNext, onEventClick, onCreateOnDay }) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  // Build an array of all day cells for the grid
  const days = []
  let day = gridStart
  while (day <= gridEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const eventsOnDay = (d) => events.filter(e => {
    try { return isSameDay(parseISO(e.date || e.startDate), d) } catch { return false }
  })

  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : []

  const statusColor = (status) => ({
    approved: 'bg-green-500',
    pending:  'bg-yellow-400',
    rejected: 'bg-red-500',
  }[status] || 'bg-gray-400')

  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex gap-6">
      {/* ── Calendar Grid ── */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary-50 to-white">
          <button onClick={onMonthPrev} className="p-2 rounded-lg hover:bg-primary-100 transition"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold tracking-wide">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={onMonthNext} className="p-2 rounded-lg hover:bg-primary-100 transition"><ChevronRight size={20} /></button>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 border-b">
          {DOW.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dayEvents = eventsOnDay(d)
            const isCurrentMonth = isSameMonth(d, currentDate)
            const isSelected = selectedDay && isSameDay(selectedDay, d)
            const isToday = isSameDay(d, new Date())
            return (
              <div
                key={i}
                onClick={() => onDayClick(d)}
                className={`min-h-[90px] p-2 border-b border-r cursor-pointer transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : 'hover:bg-primary-50'}
                  ${isSelected ? 'bg-primary-100 ring-2 ring-primary-400 ring-inset' : ''}`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1
                  ${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                  {format(d, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(evt => (
                    <div
                      key={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(evt) }}
                      className={`text-xs text-white rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 transition ${statusColor(evt.status)}`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 px-6 py-3 border-t bg-gray-50 text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Approved</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Rejected</span>
        </div>
      </div>

      {/* ── Day Events Sidebar ── */}
      <div className="w-72 shrink-0">
        {selectedDay ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-full">
            <div className="px-4 py-3 border-b bg-primary-50">
              <p className="text-sm text-gray-500">Events on</p>
              <p className="text-lg font-bold text-primary-700">{format(selectedDay, 'EEEE, MMM d')}</p>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No events scheduled</p>
                </div>
              ) : (
                selectedEvents.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => onEventClick(evt)}
                    className="w-full text-left p-3 rounded-lg border hover:border-primary-400 hover:bg-primary-50 transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor(evt.status)}`}></span>
                      <p className="font-semibold text-sm truncate group-hover:text-primary-700">{evt.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-4">{evt.category} • {evt.mode || 'Offline'}</p>
                    {evt.time && <p className="text-xs text-gray-400 ml-4 mt-0.5">{evt.time || evt.startTime}</p>}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center h-48 text-gray-400">
            <Calendar size={36} className="mb-2 opacity-30" />
            <p className="text-sm font-medium">Click a date to see events</p>
          </div>
        )}
      </div>
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

// ─── Event Details Modal ──────────────────────────────────────────────────────
function EventDetailsModal({ event, onClose, onEdit }) {
  const statusStyles = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Banner */}
        {event.bannerImage ? (
          <img src={event.bannerImage} alt={event.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-20 bg-gradient-to-r from-primary-500 to-primary-700" />
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[event.status] || 'bg-gray-100 text-gray-600'}`}>
                {event.status}
              </span>
              <h2 className="text-xl font-bold mt-2">{event.title}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>

          {event.shortDescription && (
            <p className="text-gray-600 text-sm mb-3 italic">{event.shortDescription}</p>
          )}
          {event.description && (
            <p className="text-gray-700 text-sm mb-4">{event.description}</p>
          )}

          <div className="space-y-2 text-sm">
            {(event.date || event.startDate) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-primary-500 shrink-0" />
                <span>{format(parseISO(event.date || event.startDate), 'EEEE, MMMM d yyyy')}
                {event.time || event.startTime ? ` at ${event.time || event.startTime}` : ''}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-primary-500 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            {event.category && (
              <div className="flex items-center gap-2 text-gray-600">
                <Tag size={14} className="text-primary-500 shrink-0" />
                <span>{event.category} • {event.mode || 'Offline'} • {event.participationType || 'Individual'}</span>
              </div>
            )}
            {event.maxParticipants && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={14} className="text-primary-500 shrink-0" />
                <span>Max {event.maxParticipants} participants</span>
              </div>
            )}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {event.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">{t}</span>)}
              </div>
            )}
            
            {/* Dynamic Details view */}
            {event.contactName && (
              <div className="mt-4 pt-3 border-t space-y-2">
                <p className="font-semibold text-gray-700 text-xs uppercase">Contact Information</p>
                <p><span className="font-medium">Name:</span> {event.contactName}</p>
                {event.contactEmail && <p><span className="font-medium">Email:</span> {event.contactEmail}</p>}
                {event.contactPhone && <p><span className="font-medium">Phone:</span> {event.contactPhone}</p>}
              </div>
            )}
            
            {event.category === 'Hackathon' && (
              <div className="mt-4 pt-3 border-t space-y-2">
                <p className="font-semibold text-purple-700 text-xs uppercase">Hackathon Details</p>
                {event.prizePool && <p><span className="font-medium">Prize Pool:</span> {event.prizePool}</p>}
                {event.winnerRewards && <p><span className="font-medium">Rewards:</span> {event.winnerRewards}</p>}
                {event.domains && <p><span className="font-medium">Domains:</span> {event.domains}</p>}
                {event.eligibility && <p><span className="font-medium">Eligibility:</span> {event.eligibility}</p>}
                {event.problemStatementPdf && (
                  <p><a href={event.problemStatementPdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Problem Statement</a></p>
                )}
                <p><span className="font-medium">Team Size:</span> {event.teamSizeMin || 1} to {event.maxTeamSize || 'Unlimited'}</p>
                <p><span className="font-medium">Team Formation:</span> {event.teamFormationAllowed ? 'Allowed in-app' : 'Not Allowed'}</p>
              </div>
            )}
            
            {event.category === 'Competition' && (
              <div className="mt-4 pt-3 border-t space-y-2">
                <p className="font-semibold text-green-700 text-xs uppercase">Competition Details</p>
                {event.competitionType && <p><span className="font-medium">Type:</span> {event.competitionType}</p>}
                {event.rules && <p><span className="font-medium">Rules:</span> {event.rules}</p>}
                {event.eligibility && <p><span className="font-medium">Eligibility:</span> {event.eligibility}</p>}
              </div>
            )}
            
            {event.category === 'Workshop' && (
              <div className="mt-4 pt-3 border-t space-y-2">
                <p className="font-semibold text-blue-700 text-xs uppercase">Workshop Details</p>
                {event.speakerName && <p><span className="font-medium">Speaker:</span> {event.speakerName} {event.speakerDesignation ? `(${event.speakerDesignation})` : ''}</p>}
                {event.organization && <p><span className="font-medium">Organization:</span> {event.organization}</p>}
                <p><span className="font-medium">Certificate:</span> {event.certificateProvided ? 'Provided' : 'No'}</p>
              </div>
            )}
            
            {event.category === 'Seminar' && (
              <div className="mt-4 pt-3 border-t space-y-2">
                <p className="font-semibold text-orange-700 text-xs uppercase">Seminar Details</p>
                {event.speakerName && <p><span className="font-medium">Speaker:</span> {event.speakerName}</p>}
                {event.seminarTopic && <p><span className="font-medium">Topic:</span> {event.seminarTopic}</p>}
                <p><span className="font-medium">Certificate:</span> {event.certificateProvided ? 'Provided' : 'No'}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 text-sm font-medium">Close</button>
            <button onClick={() => onEdit(event)} className="flex-1 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium flex items-center justify-center gap-1.5">
              <Edit size={14} /> Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventModal({ event, onClose, onSubmit }) {
  const { events, uploadProgress } = useEventStore()
  const { predictAttendance, predictApprovalSuccess } = useAnalyticsStore()
  const [step, setStep] = useState(event ? 2 : 1)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(event || {
    title: '',
    shortDescription: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    registrationDeadlineDate: '',
    registrationDeadlineTime: '',
    mode: 'Offline',
    location: '',
    category: '',
    tags: [],
    maxParticipants: '',
    participationType: 'Individual',
    maxTeamSize: '',
    bannerImage: '',
    additionalImage: '',
    capacity: 50,
    
    // Contact details (Common)
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    
    // Eligibility (Common)
    eligibility: 'All Students',
    
    // Hackathon details
    prizePool: '',
    teamSizeMin: '',
    teamFormationAllowed: true,
    winnerRewards: '',
    problemStatementPdf: '',
    domains: '',
    
    // Competition details
    competitionType: '',
    rules: '',
    
    // Workshop / Seminar details
    speakerName: '',
    speakerDesignation: '',
    organization: '',
    certificateProvided: false,
    seminarTopic: ''
  })
  
  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({
        ...formData,
        additionalImageFiles: files,
        // create object URLs for preview if needed
      });
    }
  }

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field + 'File']: file, [field]: URL.createObjectURL(file) });
    }
  }

  const prediction = formData.title && formData.category ? 
    predictAttendance(formData, events.filter(e => e.status === 'approved')) : null
  const approvalPred = formData.title ? predictApprovalSuccess(formData) : null
  

  const handleRemoveExistingImage = (idx) => {
    const newAdditionalImages = [...(formData.additionalImages || [])];
    const newAdditionalImagesPublicIds = [...(formData.additionalImagesPublicIds || [])];
    const deletedPublicId = newAdditionalImagesPublicIds[idx];
    
    newAdditionalImages.splice(idx, 1);
    newAdditionalImagesPublicIds.splice(idx, 1);
    
    const newDeletedIds = [...(formData.deletedImagesPublicIds || [])];
    if (deletedPublicId) {
       newDeletedIds.push(deletedPublicId);
    }
    
    setFormData({
      ...formData,
      additionalImages: newAdditionalImages,
      additionalImagesPublicIds: newAdditionalImagesPublicIds,
      deletedImagesPublicIds: newDeletedIds
    });
  }

    const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const finalData = {
      ...formData,
      date: formData.startDate,
      time: formData.startTime,
      capacity: formData.maxParticipants || formData.capacity
    }
    try {
      await onSubmit(finalData)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const categories = ['Workshop', 'Hackathon', 'Seminar', 'Competition', 'Club Activity'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        
        {step === 1 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">What type of event would you like to create?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFormData({ ...formData, category: cat, participationType: cat === 'Hackathon' ? 'Team' : 'Individual' })
                    setStep(2)
                  }}
                  className="flex flex-col items-center justify-center p-6 border-2 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition"
                >
                  <span className="font-bold text-gray-800 text-lg">{cat}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold uppercase">{formData.category}</span>
              {!event && (
                <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Change Type</button>
              )}
            </div>

            {/* Common Fields */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Common Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title <span className="text-red-600">*</span></label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Short Description (1-2 lines) <span className="text-red-600">*</span></label>
                  <input type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Detailed Description <span className="text-red-600">*</span></label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="4" required />
                </div>
              </div>
            </section>

          {/* Section 2: Contact Info */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person Name <span className="text-red-600">*</span></label>
                <input type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email <span className="text-red-600">*</span></label>
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone <span className="text-red-600">*</span></label>
                <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
          </section>

          {/* Section 3: Date & Location */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Date & Location</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date <span className="text-red-600">*</span></label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time <span className="text-red-600">*</span></label>
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time (optional)</label>
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Registration Deadline Date <span className="text-red-600">*</span></label>
                <input type="date" value={formData.registrationDeadlineDate} onChange={(e) => setFormData({ ...formData, registrationDeadlineDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Deadline Time <span className="text-red-600">*</span></label>
                <input type="time" value={formData.registrationDeadlineTime} onChange={(e) => setFormData({ ...formData, registrationDeadlineTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mode <span className="text-red-600">*</span></label>
                <select value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option>Offline</option>
                  <option>Online</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Venue / Platform Link <span className="text-red-600">*</span></label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Tags & Participation</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Eligibility <span className="text-red-600">*</span></label>
                <select value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option>All Students</option>
                  <option>1st Year Only</option>
                  <option>2nd Year Only</option>
                  <option>3rd Year Only</option>
                  <option>4th Year Only</option>
                  <option>CSE Only</option>
                  <option>Open to All Departments</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated) (optional)</label>
                <input type="text" value={formData.tags?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="AI, Web Dev, Design" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants (optional)</label>
                <input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || '' })} placeholder="e.g. 100" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </section>

            {/* Dynamic Type-Specific Sections */}
            {formData.category === 'Hackathon' && (
              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-purple-700">Hackathon Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Participation Type <span className="text-red-600">*</span></label>
                    <select value={formData.participationType} onChange={(e) => setFormData({ ...formData, participationType: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                      <option value="Individual">Individual</option>
                      <option value="Team">Team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prizes <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.prizePool} onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="$10,000 or Swags" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Team Size <span className="text-red-600">*</span></label>
                    <input type="number" value={formData.teamSizeMin} onChange={(e) => setFormData({ ...formData, teamSizeMin: parseInt(e.target.value) || '' })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Team Size <span className="text-red-600">*</span></label>
                    <input type="number" value={formData.maxTeamSize} onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) || '' })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 4" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Domains <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.domains} onChange={(e) => setFormData({ ...formData, domains: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Web, App, AI" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Winner Rewards (optional)</label>
                    <input type="text" value={formData.winnerRewards} onChange={(e) => setFormData({ ...formData, winnerRewards: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Internships, Credits" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Problem Statement PDF (optional)</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleImageUpload(e, 'problemStatementPdf')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="teamAllowed" checked={formData.teamFormationAllowed} onChange={(e) => setFormData({ ...formData, teamFormationAllowed: e.target.checked })} className="w-4 h-4 text-primary-600" />
                  <label htmlFor="teamAllowed" className="text-sm font-medium text-gray-700">Allow in-app Team Formation (optional)</label>
                </div>
              </section>
            )}

            {formData.category === 'Competition' && (
              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-green-700">Competition Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Participation Type <span className="text-red-600">*</span></label>
                    <select value={formData.participationType} onChange={(e) => setFormData({ ...formData, participationType: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                      <option value="Individual">Individual</option>
                      <option value="Team">Team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Competition Type <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.competitionType} onChange={(e) => setFormData({ ...formData, competitionType: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Ideathon, Coding, Design" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rules (link or text) <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.rules} onChange={(e) => setFormData({ ...formData, rules: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                  </div>
                </div>
              </section>
            )}

            {formData.category === 'Workshop' && (
              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-blue-700">Workshop Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Speaker Name <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.speakerName} onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Speaker Designation <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.speakerDesignation} onChange={(e) => setFormData({ ...formData, speakerDesignation: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Organization <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Certificate Provided (optional)</label>
                    <select value={formData.certificateProvided ? "Yes" : "No"} onChange={(e) => setFormData({ ...formData, certificateProvided: e.target.value === "Yes" })} className="w-full px-4 py-2 border rounded-lg">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {formData.category === 'Seminar' && (
              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-orange-700">Seminar Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Speaker Name <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.speakerName} onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Seminar Topic <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.seminarTopic} onChange={(e) => setFormData({ ...formData, seminarTopic: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Organization (optional)</label>
                    <input type="text" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Certificate Provided (optional)</label>
                    <select value={formData.certificateProvided ? "Yes" : "No"} onChange={(e) => setFormData({ ...formData, certificateProvided: e.target.value === "Yes" })} className="w-full px-4 py-2 border rounded-lg">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

          {/* Section 6: Media */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section 6: Media</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Banner Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerImage')} className="w-full px-4 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">(Optional) Additional Images</label>
                <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="w-full px-4 py-2 border rounded-lg mb-2" />
                {formData.additionalImageFiles && formData.additionalImageFiles.length > 0 && (
                  <p className="text-sm text-green-600 mb-2">{formData.additionalImageFiles.length} new image(s) selected.</p>
                )}
                {formData.additionalImages && formData.additionalImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing Gallery Images (Click 'X' to delete):</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {formData.additionalImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-lg border aspect-[4/3] cursor-pointer" onClick={() => { setViewerImages(formData.additionalImages); setViewerIndex(idx); }}>
                          <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(idx); }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete Image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>
          
          {/* Predictive Insights */}
          {prediction && approvalPred && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3">AI Predictions</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Expected Attendance</p>
                  <p className="text-xl font-bold text-blue-600">~{prediction.predicted}</p>
                  <p className="text-xs text-gray-500">{prediction.confidence} confidence</p>
                </div>
                <div>
                  <p className="text-gray-600">Approval Probability</p>
                  <p className="text-xl font-bold text-green-600">{approvalPred.probability}%</p>
                  <p className="text-xs text-gray-500">{approvalPred.confidence} confidence</p>
                </div>
              </div>
            </div>
          )}
          
          {isSubmitting && uploadProgress > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading Images...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              {isSubmitting ? 'Processing...' : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
