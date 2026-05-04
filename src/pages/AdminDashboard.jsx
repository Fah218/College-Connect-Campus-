import { useState } from 'react'
import { useEventStore } from '../store/eventStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import InsightCard from '../components/InsightCard'
import ExportButton from '../components/ExportButton'
import Timeline from '../components/Timeline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, Users, CheckCircle, Clock, FileText, Eye, X, MapPin, Tag, Info } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const { events, approveEvent, rejectEvent, getAuditLogs } = useEventStore()
  const { generateInsights } = useAnalyticsStore()
  const { addNotification, user } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState('approvals')
  const [viewingEvent, setViewingEvent] = useState(null)
  
  const insights = generateInsights(events)
  const auditLogs = getAuditLogs()
  
  const handleApprove = (id) => {
    approveEvent(id, user?.name)
    addNotification({
      title: 'Event Approved',
      message: 'The event has been approved successfully',
      priority: 'medium'
    })
  }
  
  const handleReject = (id, comment) => {
    rejectEvent(id, comment, user?.name)
    addNotification({
      title: 'Event Rejected',
      message: 'The event has been rejected',
      priority: 'medium'
    })
  }
  
  const pendingEvents = events.filter(e => e.status === 'pending')
  const approvedEvents = events.filter(e => e.status === 'approved')
  
  const clubData = events.reduce((acc, event) => {
    acc[event.club] = (acc[event.club] || 0) + (event.attendees || 0)
    return acc
  }, {})
  
  const chartData = Object.entries(clubData).map(([name, attendees]) => ({
    name,
    attendees
  }))
  
  const monthlyData = [
    { month: 'Sep', events: 12 },
    { month: 'Oct', events: 18 },
    { month: 'Nov', events: 15 },
    { month: 'Dec', events: 22 },
    { month: 'Jan', events: 20 }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Calendar} title="Total Events" value={events.length} color="primary" />
          <StatCard icon={CheckCircle} title="Approved" value={approvedEvents.length} color="green" />
          <StatCard icon={Clock} title="Pending Approval" value={pendingEvents.length} color="orange" />
          <StatCard icon={Users} title="Total Participants" value={events.reduce((sum, e) => sum + (e.attendees || 0), 0)} color="purple" />
        </div>
        
        {/* Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Platform Insights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setSelectedTab('approvals')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${selectedTab === 'approvals' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
            >
              Event Approvals ({pendingEvents.length})
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${selectedTab === 'analytics' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setSelectedTab('timeline')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${selectedTab === 'timeline' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setSelectedTab('audit')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${selectedTab === 'audit' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setSelectedTab('clubs')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${selectedTab === 'clubs' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
            >
              Club Management
            </button>
          </div>
          
          <div className="p-6">
            {selectedTab === 'approvals' && (
              <ApprovalSection events={pendingEvents} onApprove={handleApprove} onReject={handleReject} onView={setViewingEvent} />
            )}
            
            {selectedTab === 'analytics' && (
              <AnalyticsSection chartData={chartData} monthlyData={monthlyData} events={events} />
            )}
            
            {selectedTab === 'timeline' && (
              <Timeline events={events} userRole="admin" />
            )}
            
            {selectedTab === 'audit' && (
              <AuditSection logs={auditLogs} />
            )}
            
            {selectedTab === 'clubs' && (
              <ClubSection />
            )}
          </div>
        </div>
      </div>

      {/* Event Detail View Modal */}
      {viewingEvent && (
        <AdminEventViewModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onApprove={(id) => { handleApprove(id); setViewingEvent(null) }}
          onReject={(id, comment) => { handleReject(id, comment); setViewingEvent(null) }}
        />
      )}
    </div>
  )
}

function ApprovalSection({ events, onApprove, onReject, onView }) {
  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending events to review</p>
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
            {/* Banner strip if banner exists */}
            {event.bannerImage && (
              <img src={event.bannerImage} alt={event.title} className="w-full h-28 object-cover rounded-lg mb-4" />
            )}

            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{event.title}</h3>
                <p className="text-sm text-gray-500">by <span className="font-medium text-gray-700">{event.club}</span>
                  {event.category && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">{event.category}</span>}
                </p>
              </div>
              <span className="ml-3 shrink-0 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Pending Review
              </span>
            </div>

            {event.shortDescription && (
              <p className="text-sm text-gray-600 italic mb-3 line-clamp-2">{event.shortDescription}</p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
              {(event.date || event.startDate) && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary-500" />
                  <span>{format(new Date(event.date || event.startDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {(event.time || event.startTime) && (
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-primary-500" />
                  <span>{event.time || event.startTime}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary-500" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              {(event.capacity || event.maxParticipants) && (
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-primary-500" />
                  <span>Max {event.maxParticipants || event.capacity}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                onClick={() => onView(event)}
                className="flex items-center gap-1.5 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition"
              >
                <Eye size={15} /> View Details
              </button>
              <button
                onClick={() => onApprove(event.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition"
              >
                <CheckCircle size={15} /> Approve
              </button>
              <button
                onClick={() => {
                  const comment = prompt('Please enter the rejection reason:')
                  if (comment) onReject(event.id, comment)
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition"
              >
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Admin Event View Modal ───────────────────────────────────────────────────
function AdminEventViewModal({ event, onClose, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Banner */}
        {event.bannerImage ? (
          <img src={event.bannerImage} alt={event.title} className="w-full h-48 object-cover rounded-t-2xl" />
        ) : (
          <div className="w-full h-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-t-2xl" />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending Review</span>
                {event.category && <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">{event.category}</span>}
                {event.mode && <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">{event.mode}</span>}
              </div>
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Submitted by <span className="font-medium text-gray-700">{event.club}</span></p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 shrink-0"><X size={20} /></button>
          </div>

          {/* Short Description */}
          {event.shortDescription && (
            <p className="text-gray-600 italic text-sm mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-primary-400">
              {event.shortDescription}
            </p>
          )}

          {/* Full Description */}
          {event.description && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            {(event.date || event.startDate) && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <Calendar size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-medium">{format(new Date(event.date || event.startDate), 'EEE, MMM d yyyy')}</p>
                  {(event.time || event.startTime) && <p className="text-gray-500 text-xs">{event.time || event.startTime}</p>}
                </div>
              </div>
            )}
            {event.endDate && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <Calendar size={16} className="text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="font-medium">{format(new Date(event.endDate), 'EEE, MMM d yyyy')}</p>
                  {event.endTime && <p className="text-gray-500 text-xs">{event.endTime}</p>}
                </div>
              </div>
            )}
            {event.registrationDeadlineDate && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <Clock size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-red-500 font-medium">Registration Deadline</p>
                  <p className="font-medium">{format(new Date(event.registrationDeadlineDate), 'EEE, MMM d yyyy')}</p>
                  {event.registrationDeadlineTime && <p className="text-gray-500 text-xs">{event.registrationDeadlineTime}</p>}
                </div>
              </div>
            )}
            {event.location && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            )}
            {(event.maxParticipants || event.capacity) && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <Users size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Participants</p>
                  <p className="font-medium">Max {event.maxParticipants || event.capacity}</p>
                  {event.participationType && <p className="text-gray-500 text-xs">{event.participationType}{event.maxTeamSize ? ` • Max ${event.maxTeamSize}/team` : ''}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((t, i) => <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">{t}</span>)}
              </div>
            </div>
          )}

          {/* Rejection reason input */}
          {showRejectBox && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400"
                rows={3}
                autoFocus
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">Close</button>
            {!showRejectBox ? (
              <>
                <button
                  onClick={() => setShowRejectBox(true)}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <X size={15} /> Reject Event
                </button>
                <button
                  onClick={() => onApprove(event.id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={15} /> Approve Event
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowRejectBox(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium">Cancel</button>
                <button
                  onClick={() => {
                    if (rejectReason.trim()) onReject(event.id, rejectReason)
                    else alert('Please enter a rejection reason.')
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                >
                  Confirm Rejection
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsSection({ chartData, monthlyData, events }) {
  const exportData = events.map(e => ({
    Title: e.title,
    Club: e.club,
    Date: e.date,
    Attendees: e.attendees,
    Status: e.status
  }))
  
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <div className="flex gap-2">
          <ExportButton data={exportData} filename="event_report" type="csv" />
          <ExportButton data={exportData} filename="event_report" type="pdf" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Most Active Clubs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="attendees" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Monthly Event Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function AuditSection({ logs }) {
  const exportData = logs.map(log => ({
    Action: log.action,
    Event: log.eventTitle,
    User: log.user,
    Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    Remarks: log.remarks || '-'
  }))
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        <ExportButton data={exportData} filename="audit_logs" type="csv" />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.slice(0, 20).map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.action === 'approved' ? 'bg-green-100 text-green-700' :
                    log.action === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{log.eventTitle}</td>
                <td className="px-6 py-4 text-sm">{log.user}</td>
                <td className="px-6 py-4 text-sm">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {logs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No audit logs available
        </div>
      )}
    </div>
  )
}

function ClubSection() {
  const clubs = [
    { id: 1, name: 'Tech Club', head: 'John Doe', members: 45, events: 12 },
    { id: 2, name: 'Coding Club', head: 'Jane Smith', members: 38, events: 8 },
    { id: 3, name: 'AI Club', head: 'Bob Johnson', members: 52, events: 15 }
  ]
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Head</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {clubs.map(club => (
            <tr key={club.id}>
              <td className="px-6 py-4 font-medium">{club.name}</td>
              <td className="px-6 py-4">{club.head}</td>
              <td className="px-6 py-4">{club.members}</td>
              <td className="px-6 py-4">{club.events}</td>
              <td className="px-6 py-4">
                <button className="text-primary-600 hover:text-primary-700">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
