import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { User, Award, Calendar, Users, Edit } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import ProfileEditForm from '../components/ProfileEditForm'

export default function StudentProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  
  const skillData = user?.skills?.map(skill => ({ skill, proficiency: 75 })) || [
    { skill: 'React', proficiency: 85 },
    { skill: 'Python', proficiency: 75 },
    { skill: 'Node.js', proficiency: 70 },
    { skill: 'ML', proficiency: 60 },
    { skill: 'Design', proficiency: 55 }
  ]
  
  const participationData = [
    { month: 'Sep', events: 3 },
    { month: 'Oct', events: 5 },
    { month: 'Nov', events: 4 },
    { month: 'Dec', events: 6 }
  ]
  
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
              {/* Skills Radar Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Skill Proficiency</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Proficiency" dataKey="proficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
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
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Web Development</span>
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Artificial Intelligence</span>
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Open Source</span>
                  </div>
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
              <StatBox icon={Calendar} label="Events Registered" value="24" color="blue" />
              <StatBox icon={Award} label="Events Attended" value="18" color="green" />
              <StatBox icon={Users} label="Upcoming Events" value="6" color="purple" />
            </div>
            
            {/* Clubs Interaction */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🏫 Clubs Interaction</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-700 mb-2">Clubs Joined</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Tech Club</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">AI Club</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-700 mb-2">Clubs Interacted With</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Coding Club</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Robotics Society</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hackathon Experience */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Hackathon Experience</h3>
              <div className="space-y-3">
                {[
                  { name: 'AI Innovation Challenge', position: '2nd Place', date: 'Dec 2024' },
                  { name: 'Web Dev Sprint', position: 'Participant', date: 'Nov 2024' }
                ].map((hack, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{hack.name}</p>
                      <p className="text-sm text-gray-600">{hack.date}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      {hack.position}
                    </span>
                  </div>
                ))}
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
