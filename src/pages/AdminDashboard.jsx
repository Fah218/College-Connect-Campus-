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
import { Calendar, Users, CheckCircle, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const { events, approveEvent, rejectEvent, getAuditLogs } = useEventStore()
  const { generateInsights } = useAnalyticsStore()
  const { addNotification, user } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState('approvals')
  
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
              <ApprovalSection events={pendingEvents} onApprove={handleApprove} onReject={handleReject} />
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
    </div>
  )
}

function ApprovalSection({ events, onApprove, onReject }) {
  const [rejectComment, setRejectComment] = useState({})
  
  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No pending events to review
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600">by {event.club}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                Pending
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Date:</span> {format(new Date(event.date), 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="text-gray-600">Time:</span> {event.time}
              </div>
              <div>
                <span className="text-gray-600">Location:</span> {event.location}
              </div>
              <div>
                <span className="text-gray-600">Capacity:</span> {event.capacity}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{event.description}</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(event.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  const comment = prompt('Rejection reason:')
                  if (comment) onReject(event.id, comment)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
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
