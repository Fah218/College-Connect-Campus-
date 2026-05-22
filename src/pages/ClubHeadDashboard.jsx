import { useState, useMemo } from 'react'
import { useEventStore } from '../store/eventStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import Timeline from '../components/Timeline'
import PredictiveInsights from '../components/PredictiveInsights'
import ExportButton from '../components/ExportButton'
import { Calendar, Users, CheckCircle, Clock, Plus, Edit, Trash2, Layout, List, ChevronLeft, ChevronRight, X, MapPin, Tag } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'

export default function ClubHeadDashboard() {
  const { events, addEvent, updateEvent, deleteEvent, getEventSummary } = useEventStore()
  const { predictAttendance } = useAnalyticsStore()
  const { addNotification } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('table')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [viewingEvent, setViewingEvent] = useState(null)
  
  const myEvents = events.filter(e => e.club === 'Tech Club')
  const pendingEvents = myEvents.filter(e => e.status === 'pending')
  const approvedEvents = myEvents.filter(e => e.status === 'approved')
  
  const handleSubmit = async (formData) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, formData)
      addNotification({
        title: 'Event Updated',
        message: `${formData.title} has been updated`,
        priority: 'low'
      })
    } else {
      try {
        await addEvent({ ...formData, club: 'Tech Club' })
        addNotification({
          title: 'Event Created',
          message: `${formData.title} has been submitted for approval`,
          priority: 'medium'
        })
      } catch (error) {
        addNotification({
          title: 'Error',
          message: 'Failed to create event in database.',
          priority: 'high'
        })
      }
    }
    setShowModal(false)
    setEditingEvent(null)
  }
  
  const exportData = myEvents.map(e => ({
    Title: e.title,
    Date: e.date,
    Status: e.status,
    Attendees: e.attendees,
    Capacity: e.capacity
  }))
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Club Head Dashboard</h1>
          <div className="flex gap-2">
            <ExportButton data={exportData} filename="club_events" type="csv" />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus size={20} />
              Create Event
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Calendar} title="Total Events" value={myEvents.length} color="primary" />
          <StatCard icon={CheckCircle} title="Approved" value={approvedEvents.length} color="green" />
          <StatCard icon={Clock} title="Pending Approval" value={pendingEvents.length} color="orange" />
          <StatCard icon={Users} title="Total Attendees" value={myEvents.reduce((sum, e) => sum + (e.attendees || 0), 0)} color="purple" />
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
                    <td className="px-6 py-4 text-sm">{format(new Date(event.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'approved' ? 'bg-green-100 text-green-700' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{event.attendees}/{event.capacity}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event)
                            setShowModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
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
  const { events } = useEventStore()
  const { predictAttendance, predictApprovalSuccess } = useAnalyticsStore()
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
    category: 'Workshop',
    tags: [],
    maxParticipants: '',
    participationType: 'Individual',
    maxTeamSize: '',
    bannerImage: '',
    // keep compatibility with old properties
    capacity: 50,
  })
  
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  const prediction = formData.title && formData.category ? 
    predictAttendance(formData, events.filter(e => e.status === 'approved')) : null
  const approvalPred = formData.title ? predictApprovalSuccess(formData) : null
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // map new fields to old ones for backward compatibility if needed
    const finalData = {
      ...formData,
      date: formData.startDate,
      time: formData.startTime,
      capacity: formData.maxParticipants || formData.capacity
    }
    onSubmit(finalData)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">{event ? 'Edit Event' : 'Create New Event'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section 1: Basic Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Description (1-2 lines for preview cards) *</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Detailed Description (full info) *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="4"
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 2: Date & Time */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section 2: Date & Time</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-red-600">Registration Deadline Date *</label>
                <input type="date" value={formData.registrationDeadlineDate} onChange={(e) => setFormData({ ...formData, registrationDeadlineDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-red-600">Registration Deadline Time *</label>
                <input type="time" value={formData.registrationDeadlineTime} onChange={(e) => setFormData({ ...formData, registrationDeadlineTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
          </section>

          {/* Section 3: Location */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section 3: Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option>Offline</option>
                  <option>Online</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Venue / Platform Link</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder={formData.mode === 'Online' ? 'e.g., Zoom Link' : 'e.g., Main Auditorium'} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
          </section>

          {/* Section 4: Category & Tags */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section 4: Category & Tags</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option>Workshop</option>
                  <option>Seminar</option>
                  <option>Hackathon</option>
                  <option>Competition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input type="text" value={formData.tags?.join(', ') || formData.domains?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="AI, Web Dev, Design" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </section>

          {/* Section 5: Participation Settings */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section 5: Participation Settings</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Participation Type</label>
                <select value={formData.participationType} onChange={(e) => setFormData({ ...formData, participationType: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option>Individual</option>
                  <option>Team</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants (optional)</label>
                <input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || '' })} placeholder="e.g. 100" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            {formData.participationType === 'Team' && (
              <div>
                <label className="block text-sm font-medium mb-1">Max Team Size</label>
                <input type="number" value={formData.maxTeamSize} onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) || '' })} placeholder="e.g. 4" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            )}
          </section>

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
                <input type="file" accept="image/*" className="w-full px-4 py-2 border rounded-lg" />
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
          
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
              {event ? 'Update' : 'Create'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
