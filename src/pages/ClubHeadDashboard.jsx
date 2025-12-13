import { useState } from 'react'
import { useEventStore } from '../store/eventStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import Timeline from '../components/Timeline'
import PredictiveInsights from '../components/PredictiveInsights'
import ExportButton from '../components/ExportButton'
import { Calendar, Users, CheckCircle, Clock, Plus, Edit, Trash2, Layout, List } from 'lucide-react'
import { format } from 'date-fns'

export default function ClubHeadDashboard() {
  const { events, addEvent, updateEvent, deleteEvent, getEventSummary } = useEventStore()
  const { predictAttendance } = useAnalyticsStore()
  const { addNotification } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('table')
  
  const myEvents = events.filter(e => e.club === 'Tech Club')
  const pendingEvents = myEvents.filter(e => e.status === 'pending')
  const approvedEvents = myEvents.filter(e => e.status === 'approved')
  
  const handleSubmit = (formData) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, formData)
      addNotification({
        title: 'Event Updated',
        message: `${formData.title} has been updated`,
        priority: 'low'
      })
    } else {
      const newEvent = addEvent({ ...formData, club: 'Tech Club' })
      addNotification({
        title: 'Event Created',
        message: `${formData.title} has been submitted for approval`,
        priority: 'medium'
      })
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
        </div>
        
        {view === 'timeline' ? (
          <Timeline events={myEvents} userRole="club_head" />
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

function EventModal({ event, onClose, onSubmit }) {
  const { events, getEventSummary } = useEventStore()
  const { predictAttendance, predictApprovalSuccess } = useAnalyticsStore()
  const [formData, setFormData] = useState(event || {
    title: '',
    category: 'Workshop',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: 50,
    tags: [],
    domains: [],
    collaboratingClubs: []
  })
  
  const [showPredictions, setShowPredictions] = useState(false)
  
  const prediction = formData.title && formData.category ? 
    predictAttendance(formData, events.filter(e => e.status === 'approved')) : null
  const approvalPred = formData.title ? predictApprovalSuccess(formData) : null
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">{event ? 'Edit Event' : 'Create Event'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Hackathon</option>
                <option>Competition</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows="3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Domains (comma-separated)</label>
            <input
              type="text"
              value={formData.domains?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, domains: e.target.value.split(',').map(d => d.trim()) })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="AI, Web Development, etc."
            />
          </div>
          
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
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {event ? 'Update' : 'Create'} Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
