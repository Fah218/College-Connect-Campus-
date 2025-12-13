import { useState, useEffect } from 'react'
import { useEventStore } from '../store/eventStore'
import { useHackathonStore } from '../store/hackathonStore'
import { useRecommendationStore } from '../store/recommendationStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import StatCard from '../components/StatCard'
import RecommendedSection from '../components/RecommendedSection'
import Timeline from '../components/Timeline'
import { Calendar, Trophy, Users, Filter, Layout, List } from 'lucide-react'

export default function StudentDashboard() {
  const { events, registeredEvents, registerForEvent } = useEventStore()
  const { hackathons } = useHackathonStore()
  const { getRecommendedEvents } = useRecommendationStore()
  const { addNotification } = useAuthStore()
  const [filter, setFilter] = useState({ category: 'all', search: '' })
  const [view, setView] = useState('list')
  
  const approvedEvents = events.filter(e => e.status === 'approved')
  const recommendations = getRecommendedEvents(approvedEvents, registeredEvents)
  
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
            value={2}
            color="green"
          />
          <StatCard
            icon={Users}
            title="Team Invitations"
            value={3}
            color="purple"
          />
          <StatCard
            icon={Calendar}
            title="Upcoming Events"
            value={approvedEvents.length}
            color="orange"
          />
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
