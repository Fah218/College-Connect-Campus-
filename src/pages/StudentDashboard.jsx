import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useHackathonStore } from '../store/hackathonStore'
import { useRecommendationStore } from '../store/recommendationStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import StatCard from '../components/StatCard'
import RecommendedSection from '../components/RecommendedSection'
import Timeline from '../components/Timeline'
import { Calendar, Trophy, Users, Filter, Layout, List, Bell, BellOff } from 'lucide-react'
import { useCalendarStore } from '../store/calendarStore'
import { format } from 'date-fns'

export default function StudentDashboard() {
  const { events } = useEventStore()
  const { hackathons, teamRequests, joinRequests, fetchHackathonData } = useHackathonStore()
  const { getRecommendedEvents } = useRecommendationStore()
  const { addNotification, user } = useAuthStore()
  const { reminders, removeReminder } = useCalendarStore()
  const { registrations, fetchStudentRegistrations } = useRegistrationStore()
  const [filter, setFilter] = useState({ category: 'all', search: '' })
  const [view, setView] = useState('list')
  
  useEffect(() => {
    fetchHackathonData?.()
    if (user?.id || user?._id) {
      fetchStudentRegistrations?.(user.id || user._id)
    }
  }, [user])
  
  const myRegistrations = registrations.filter(r => {
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
  
  const registeredEvents = myRegistrations.map(r => r.eventId?.title ? r.eventId : events.find(e => String(e.id || e._id) === String(r.eventId?._id || r.eventId))).filter(Boolean);
  
  const approvedEvents = events.filter(e => e.status === 'approved')
  const recommendations = getRecommendedEvents(approvedEvents, registeredEvents)

  const registeredHackathonIds = (registeredEvents || [])
    .filter(e => e.category === 'Hackathon')
    .map(e => String(e.id || e._id));

  const joinedHackathonsCount = new Set([...registeredHackathonIds]).size;
  
  const teamInvitationsCount = (joinRequests || []).filter(jr => 
    jr.status === 'pending' && 
    (teamRequests || []).some(tr => 
      (String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId)) && 
      (String(tr.createdBy) === String(user?.id) || String(tr.createdBy) === String(user?._id))
    )
  ).length;

  const upcomingEventsCount = approvedEvents.filter(e => {
    const eventDate = new Date(e.date || e.startDate);
    const today = new Date(new Date().setHours(0,0,0,0));
    return eventDate >= today;
  }).length;
  
  const filteredEvents = approvedEvents.filter(event => {
    const matchesCategory = filter.category === 'all' || event.category === filter.category
    const matchesSearch = event.title.toLowerCase().includes(filter.search.toLowerCase())
    return matchesCategory && matchesSearch
  })
  
  const categories = ['all', ...new Set(events.map(e => e.category))]
  
  const handleRegister = (eventId) => {
    try {
      registerForEvent(eventId)
      addNotification({
        title: 'Registration Successful',
        message: 'You have been registered for the event',
        priority: 'medium'
      })
    } catch (error) {
      addNotification({
        title: 'Registration Failed',
        message: error.message,
        priority: 'high'
      })
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Registered Events"
            value={registeredEvents.length}
            color="primary"
          />
          <StatCard
            icon={Trophy}
            title="Joined Hackathons"
            value={joinedHackathonsCount}
            color="green"
          />
          <StatCard
            icon={Users}
            title="Team Invitations"
            value={teamInvitationsCount}
            color="purple"
          />
          <StatCard
            icon={Calendar}
            title="Upcoming Events"
            value={upcomingEventsCount}
            color="orange"
          />
        </div>
        
        {/* ── My Reminders Panel ── */}
        {reminders.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-yellow-800 font-bold text-base mb-4">
                <Bell size={18} className="text-yellow-500" />
                My Reminders
                <span className="ml-auto px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full font-semibold">
                  {reminders.length}
                </span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reminders.map(r => (
                  <div key={r.eventId} className="flex items-center justify-between bg-white border border-yellow-100 rounded-lg px-4 py-3 shadow-sm">
                    <div>
                      <p className="font-semibold text-sm text-gray-800 truncate max-w-[200px]">{r.eventTitle}</p>
                      <p className="text-xs text-red-500 mt-1">
                        ⏳ Deadline: {r.deadline ? format(new Date(r.deadline), 'MMM d, yyyy') : 'TBA'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeReminder(r.eventId)}
                      className="ml-3 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                      title="Remove reminder"
                    >
                      <BellOff size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommended Section */}
        <RecommendedSection
          recommendations={recommendations}
          onRegister={handleRegister}
          registeredEvents={registeredEvents}
        />
        
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${view === 'list' ? 'bg-primary-600 text-white' : 'bg-white border'}`}
          >
            <List size={18} />
            List View
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
          <Timeline events={approvedEvents} userRole="student" />
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter size={20} />
                  <span className="font-medium">Filters:</span>
                </div>
                
                <select
                  value={filter.category}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="px-4 py-2 border rounded-lg flex-1 min-w-[200px]"
                />
              </div>
            </div>
            
            {/* Events */}
            <div>
              <h2 className="text-2xl font-bold mb-4">All Events</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={handleRegister}
                    isRegistered={registeredEvents.some(re => String(re.id || re._id) === String(event.id || event._id))}
                  />
                ))}
              </div>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No events found matching your filters
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
