import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { User, Award, Calendar, Users, Edit } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useEventStore } from '../store/eventStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import Navbar from '../components/Navbar'
import ProfileEditForm from '../components/ProfileEditForm'

export default function StudentProfilePage() {
  const { user } = useAuthStore()
  const { events, registeredEvents, fetchStudentRegistrations } = useEventStore()
  const { studentAnalytics, fetchStudentAnalytics } = useAnalyticsStore()
  const [isEditing, setIsEditing] = useState(false)
  
  useEffect(() => {
    if (user?._id) {
      fetchStudentRegistrations?.(user._id)
      fetchStudentAnalytics?.(user._id)
    }
  }, [user])
  
  // 1. Skill Data
  const skillData = user?.skills || [];
  
  // Find the actual event objects the user is registered for
  const userEvents = (events || []).filter(e => (registeredEvents || []).includes(e.id) || (registeredEvents || []).includes(e._id))

  // 2. Event Counts
  const today = new Date()
  const upcomingEvents = userEvents.filter(e => new Date(e.date || e.startDate) >= today)
  const attendedEvents = userEvents.filter(e => new Date(e.date || e.startDate) < today)

  // 3. Event Participation History
  const participationData = studentAnalytics?.profile?.participationData || []

  // 4. Clubs Interaction
  const uniqueClubs = studentAnalytics?.profile?.uniqueClubs || [];

  // 5. Hackathon Experience
  const hackathons = userEvents.filter(e => e.category === 'Hackathon')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Student Profile</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {isEditing && <ProfileEditForm onCancel={() => setIsEditing(false)} />}
            
            {/* Basic Info */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{user?.name || 'Student Name'}</h3>
                <p className="text-gray-600 mb-1 flex items-center gap-2">
                  {user?.email} {user?.phone && <span>• {user.phone}</span>}
                </p>
                <p className="text-gray-600">{user?.department || 'Computer Science'} • {user?.year || '3rd Year'}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills Display */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                {skillData.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillData.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed</p>
                )}
              </div>

              {/* Interests Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Interests & Hobbies</h3>
                {user?.interests && user.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, idx) => (
                      <span key={idx} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No interests listed</p>
                )}
              </div>
            </div>
            
            {/* Event Participation */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Event Participation History</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={participationData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatBox icon={Calendar} label="Events Registered" value={studentAnalytics?.profile?.eventsRegistered?.toString() || '0'} color="blue" />
              <StatBox icon={Award} label="Events Attended" value={studentAnalytics?.profile?.eventsAttended?.toString() || '0'} color="green" />
              <StatBox icon={Users} label="Upcoming Events" value={studentAnalytics?.profile?.upcomingEventsCount?.toString() || '0'} color="purple" />
            </div>
            
            {/* Clubs Interaction */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🏫 Clubs Interaction</h3>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-700 mb-2">Clubs Interacted With</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueClubs.length > 0 ? (
                    uniqueClubs.map((club, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{club}</span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No club interactions yet.</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Hackathon Experience */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Hackathon Experience</h3>
              <div className="space-y-3">
                {hackathons.length > 0 ? hackathons.map((hack, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{hack.title}</p>
                      <p className="text-sm text-gray-600">{new Date(hack.date || hack.startDate).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      Participant
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">No hackathon experience yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  }
  
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}
