import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { User, Award, Calendar, Users, Edit } from 'lucide-react'

export default function StudentProfile({ user, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  
  const skillData = [
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Student Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={48} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{user?.name || 'Student Name'}</h3>
              <p className="text-gray-600 mb-1">{user?.email}</p>
              <p className="text-gray-600">Computer Science • 3rd Year</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>

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
            <StatBox icon={Calendar} label="Events Attended" value="18" color="blue" />
            <StatBox icon={Award} label="Hackathons" value="5" color="green" />
            <StatBox icon={Users} label="Clubs Joined" value="3" color="purple" />
          </div>
          
          {/* Clubs Interacted */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Clubs Interacted With</h3>
            <div className="flex flex-wrap gap-2">
              {['Tech Club', 'Coding Club', 'AI Club'].map(club => (
                <span key={club} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg">
                  {club}
                </span>
              ))}
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
