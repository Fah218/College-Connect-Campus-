import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useHackathonStore } from '../store/hackathonStore'
import { useRecommendationStore } from '../store/recommendationStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import StatCard from '../components/StatCard'
import RecommendedSection from '../components/RecommendedSection'
import Timeline from '../components/Timeline'
import { Calendar, Trophy, Users, Filter, Layout, List, Bell, BellOff } from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'

export default function StudentDashboard() {
  const { events, registeredEvents, registerForEvent } = useEventStore()
  const { hackathons, teamRequests, joinRequests, fetchHackathonData } = useHackathonStore()
  const { getRecommendedEvents } = useRecommendationStore()
  const { addNotification, user, toggleSavedEvent } = useAuthStore()
  
  const [filter, setFilter] = useState({ category: 'all', search: '' })
  const [view, setView] = useState('list')
  const [notifiedEvents, setNotifiedEvents] = useState([])
  
  useEffect(() => {
    fetchHackathonData?.()
  }, [])

  // Calculate Saved Events Data
  const savedEventsData = (user?.savedEvents || []).map(savedId => {
    return events.find(e => String(e.id || e._id) === String(savedId))
  }).filter(Boolean);

  // Trigger Notifications for 24h Deadlines
  useEffect(() => {
    savedEventsData.forEach(event => {
      const deadlineStr = event.registrationDeadlineDate || event.date;
      if (!deadlineStr) return;
      
      const deadlineDate = new Date(deadlineStr);
      const hoursLeft = differenceInHours(deadlineDate, new Date());
      
      if (hoursLeft > 0 && hoursLeft <= 24 && !notifiedEvents.includes(event.id || event._id)) {
        addNotification({
          title: 'Upcoming Deadline',
          message: `Registration for "${event.title}" closes in ${hoursLeft} hours!`,
          priority: 'high'
        });
        setNotifiedEvents(prev => [...prev, event.id || event._id]);
      }
    });
  }, [savedEventsData.length, notifiedEvents, addNotification]);
  
  const approvedEvents = events.filter(e => e.status === 'approved')
  const recommendations = getRecommendedEvents(approvedEvents, registeredEvents)

  const joinedHackathonsCount = (teamRequests || []).filter(tr => tr.members?.some(m => String(m.id) === String(user?.id))).length;
  
  const teamInvitationsCount = (joinRequests || []).filter(jr => 
    jr.status === 'pending' && 
    (teamRequests || []).some(tr => 
      (String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId)) && 
      String(tr.owner?.id) === String(user?.id)
    )
  ).length;

  const upcomingEventsCount = approvedEvents.filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0))).length;
  
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
        
        {/* ── My Saved Events Panel ── */}
        <div className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-yellow-800 font-bold text-base mb-4">
              <Bell size={18} className="text-yellow-500" />
              My Saved Events
              <span className="ml-auto px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full font-semibold">
                {savedEventsData.length}
              </span>
            </h3>
            
            {savedEventsData.length === 0 ? (
              <div className="text-center py-6 bg-white border border-yellow-100 rounded-lg">
                <p className="text-sm text-gray-500">You haven't saved any events yet.</p>
                <Link to="/events" className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedEventsData.map(ev => {
                  const deadlineStr = ev.registrationDeadlineDate || ev.date;
                  const deadlineDate = deadlineStr ? new Date(deadlineStr) : null;
                  const daysLeft = deadlineDate ? differenceInDays(deadlineDate, new Date()) : null;
                  const hoursLeft = deadlineDate ? differenceInHours(deadlineDate, new Date()) : null;
                  
                  let countdownText = '';
                  if (hoursLeft !== null) {
                    if (hoursLeft < 0) countdownText = 'Closed';
                    else if (hoursLeft < 24) countdownText = `${hoursLeft} hours left`;
                    else countdownText = `${daysLeft} days left`;
                  }

                  const isRegistered = registeredEvents.some(re => String(re.id || re._id) === String(ev.id || ev._id));

                  return (
                    <div key={ev.id || ev._id} className="flex flex-col justify-between bg-white border border-yellow-100 rounded-lg p-4 shadow-sm">
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm text-gray-800 line-clamp-2 pr-2">{ev.title}</p>
                          <span className="shrink-0 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            {ev.category || ev.type || 'Event'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          📅 {deadlineDate ? format(deadlineDate, 'MMM d, yyyy') : 'No Deadline'}
                        </p>
                        {deadlineDate && (
                          <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${hoursLeft < 24 && hoursLeft >= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-50 text-orange-600'}`}>
                            ⏳ {countdownText}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        {isRegistered ? (
                          <div className="flex-1 text-center py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded">
                            Registered ✓
                          </div>
                        ) : (
                          <button
                            onClick={() => registerForEvent(ev.id || ev._id)}
                            className="flex-1 py-1.5 text-xs font-bold bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                          >
                            Register
                          </button>
                        )}
                        <button
                          onClick={() => toggleSavedEvent(ev.id || ev._id)}
                          className="px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                          title="Remove from saved"
                        >
                          <BellOff size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
                    isRegistered={registeredEvents.includes(event.id)}
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
