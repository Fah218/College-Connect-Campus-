import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'
import { useClubStore } from '../store/clubStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import ImageViewer from '../components/ImageViewer'
import StatCard from '../components/StatCard'
import InsightCard from '../components/InsightCard'
import ExportButton from '../components/ExportButton'
import Timeline from '../components/Timeline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, Users, CheckCircle, Clock, FileText, Eye, X, MapPin, Tag, Info, Maximize2 } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const { events, approveEvent, rejectEvent, getAuditLogs } = useEventStore()
  
  const { addNotification, user } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState('approvals')
  const [viewingEvent, setViewingEvent] = useState(null)
  const [managingClub, setManagingClub] = useState(null)
  const [clubHeads, setClubHeads] = useState([])
  const [viewerImages, setViewerImages] = useState(null)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [modalImageSrc, setModalImageSrc] = useState(null)
  const { clubs: realClubs, fetchClubs, toggleArchiveStatus } = useClubStore()
  const { adminStats, fetchAdminStats } = useRegistrationStore()
  
  useEffect(() => {
    const fetchClubHeads = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/auth/club-heads')
        if (res.ok) {
          const data = await res.json()
          setClubHeads(data)
        }
      } catch (err) {
        console.error('Failed to fetch club heads', err)
      }
    }
    fetchClubHeads()
    fetchClubs()
    fetchAdminStats?.()
  }, [])
  
    const { adminAnalytics } = useAnalyticsStore()
  
  
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
  
  
  
  
  
  
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Calendar} title="Total Events" value={adminAnalytics?.dashboard?.totalEvents || 0} color="primary" />
          <StatCard icon={CheckCircle} title="Approved" value={adminAnalytics?.dashboard?.approved || 0} color="green" />
          <StatCard icon={Users} title="Total Registrations" value={adminAnalytics?.dashboard?.totalRegistrations || 0} color="blue" />
          <StatCard icon={Users} title="Total Participants" value={adminAnalytics?.dashboard?.totalParticipants || 0} color="purple" />
          <StatCard icon={Users} title="Registered Teams" value={adminAnalytics?.dashboard?.registeredTeams || 0} color="orange" />
        </div>
        
        {/* Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Platform Insights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(adminAnalytics?.dashboard?.insights || []).map(insight => (
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
              <AnalyticsSection chartData={adminAnalytics?.dashboard?.chartData || []} monthlyData={adminAnalytics?.dashboard?.monthlyData || []} events={events} />
            )}
            
            {selectedTab === 'timeline' && (
              <Timeline events={events} userRole="admin" />
            )}
            
            {selectedTab === 'audit' && (
              <AuditSection logs={auditLogs} />
            )}
            
            {selectedTab === 'clubs' && (
              <ClubSection events={events} clubs={adminAnalytics?.dashboard?.clubs || []} clubHeads={clubHeads} onManage={setManagingClub} realClubs={realClubs} toggleArchiveStatus={toggleArchiveStatus} />
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
          onImageClick={(images, index) => { setViewerImages(images); setViewerIndex(index); }}
        />
      )}

      {/* Club Management page uses routing instead of Modal */}
      {/* Image Modal (legacy fallback) */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImageSrc(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X size={32} />
          </button>
          <img src={modalImageSrc} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

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
            {(event.bannerImage || (event.additionalImages?.[0] || event.additionalImage)) && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {event.bannerImage && (
                  <div className="relative group shrink-0 w-full h-28 rounded-lg overflow-hidden bg-gray-100">
                    <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewerImages([event.bannerImage]); setViewerIndex(0);; }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="text-white w-6 h-6" />
                    </button>
                  </div>
                )}
                {(event.additionalImages?.[0] || event.additionalImage) && (
                  <div className="relative group shrink-0 w-24 h-28 rounded-lg overflow-hidden bg-gray-100">
                    <img src={(event.additionalImages?.[0] || event.additionalImage)} alt="Additional" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewerImages(event.additionalImages?.length ? event.additionalImages : [event.additionalImage].filter(Boolean)); setViewerIndex(0);; }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="text-white w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
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
              {(event.capacity || event.maxParticipants) ? (
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-primary-500" />
                  <span>Max {event.maxParticipants || event.capacity}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-primary-500" />
                  <span>Unlimited</span>
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
function AdminEventViewModal({ event, onClose, onApprove, onReject, onImageClick }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Banner */}
        {event.bannerImage ? (
          <div className="flex w-full h-48 rounded-t-2xl overflow-hidden relative group">
            <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
            <button 
              onClick={() => onImageClick([event.bannerImage], 0)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="text-white w-8 h-8" />
            </button>
          </div>
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

          {/* Event Gallery */}
          {event.additionalImages && event.additionalImages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Event Gallery</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {event.additionalImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group overflow-hidden rounded-lg cursor-pointer shadow-sm border aspect-square" onClick={() => onImageClick(event.additionalImages, idx)}>
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="text-white w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
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
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const textMatches = (log.eventTitle || '').toLowerCase().includes(term) || 
                        (log.user || '').toLowerCase().includes(term) ||
                        (log.remarks || '').toLowerCase().includes(term);
    if (searchTerm && !textMatches) return false;

    if (actionFilter !== 'all' && log.action !== actionFilter) return false;

    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (dateFilter === 'today' && diffDays > 1) return false;
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }
    
    return true;
  });

  const exportData = filteredLogs.map(log => ({
    Action: log.action,
    Type: 'Event Status',
    Event: log.eventTitle,
    User: log.user,
    Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    Remarks: log.remarks || '-'
  }))
  
  return (
    <div>
      <div className="flex flex-col mb-4">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Audit Logs</h3>
        <hr className="border-gray-200 mb-4" />
        
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-3 flex-1">
            <input 
              type="text" 
              placeholder="Search Logs..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-[200px] focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <select 
              value={actionFilter} 
              onChange={e => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Filter Action ▼</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="created">Created</option>
              <option value="deleted">Deleted</option>
            </select>
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Filter Date ▼</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
          <ExportButton data={exportData} filename="audit_logs" type="csv" />
        </div>
        
        <hr className="border-gray-200 mb-4" />
      </div>
      
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredLogs.slice(0, 50).map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    log.action === 'created' ? 'bg-green-100 text-green-700 border border-green-200' :
                    log.action === 'updated' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    log.action === 'deleted' ? 'bg-red-100 text-red-700 border border-red-200' :
                    log.action === 'approved' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    log.action === 'rejected' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Event Status</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.eventTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.user}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-6 py-4 text-sm text-gray-600 italic max-w-xs truncate">{log.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12 bg-white">
            <p className="text-gray-500 font-medium">No matching audit logs found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ClubSection({ clubs, onManage }) {
  const [showArchived, setShowArchived] = useState(false);
  
  const displayedClubs = showArchived ? clubs.filter(c => c.isArchived) : clubs.filter(c => !c.isArchived);

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-gray-500 font-medium">No clubs found.</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${showArchived ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
        >
          {showArchived ? 'Show Active Clubs' : 'Show Archived Clubs'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Head</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayedClubs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {showArchived ? 'No archived clubs found.' : 'No active clubs found.'}
                </td>
              </tr>
            ) : (
              displayedClubs.map((club, idx) => (
                <tr key={club.id || idx}>
              <td className="px-6 py-4 font-medium">{club.name}</td>
              <td className="px-6 py-4">{club.head}</td>
              <td className="px-6 py-4">{club.members}</td>
              <td className="px-6 py-4">{club.events}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  club.status === 'Active' ? 'bg-green-100 text-green-700' : 
                  club.status === 'Inactive' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {club.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/admin/clubs/${club.name || club.id || idx}`}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Manage
                </Link>
              </td>
            </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
