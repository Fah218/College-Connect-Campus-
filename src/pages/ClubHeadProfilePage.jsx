import { useState } from 'react'
import { User, Calendar, CheckCircle, Clock, XCircle, Users, Trophy, TrendingUp, Edit } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'

export default function ClubHeadProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  
  const participationData = [
    { event: 'Tech Meetup', participants: 120 },
    { event: 'Hackathon', participants: 350 },
    { event: 'AI Workshop', participants: 180 },
    { event: 'Code Sprint', participants: 210 }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Club Head Profile</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* 👤 Basic Info */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={48} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{user?.name || 'Club Head User'}</h3>
                <p className="text-gray-600 mb-1 font-medium">{user?.clubName || 'Tech Club'}</p>
                <p className="text-primary-600 font-medium bg-primary-50 inline-block px-3 py-1 rounded-full text-sm mt-1">Role: Club Head</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>

            {/* 📊 Event Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📊 Event Stats</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-800 mb-1">12</p>
                  <p className="text-sm text-gray-600">Total Events Created</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-green-700 mb-1">8</p>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                  <Clock className="mx-auto text-orange-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-orange-700 mb-1">3</p>
                  <p className="text-sm text-orange-600">Pending</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                  <XCircle className="mx-auto text-red-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-red-700 mb-1">1</p>
                  <p className="text-sm text-red-600">Rejected</p>
                </div>
              </div>
            </div>

            {/* 🔥 Must Add Highlights */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy size={28} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">Top Performing Event</p>
                  <p className="text-xl font-bold text-gray-900">Annual Tech Hackathon</p>
                  <p className="text-sm text-gray-600">Highest engagement & feedback score</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Most Registrations</p>
                  <p className="text-xl font-bold text-gray-900">AI & Machine Learning Workshop</p>
                  <p className="text-sm text-gray-600">350+ Students Registered</p>
                </div>
              </div>
            </div>
            
            {/* 👥 Participation Insights */}
            <div className="bg-gray-50 rounded-lg p-6 border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users size={20} className="text-primary-600" /> 
                  Participation Insights
                </h3>
                <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">85% Avg. Attendance Rate</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={participationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="event" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="participants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* 📅 Event History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📅 Event History</h3>
              <div className="overflow-x-auto bg-white border rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Event Name</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Annual Tech Hackathon</td>
                      <td className="px-6 py-4 text-gray-600">Nov 12, 2024</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Approved</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">48-hour coding marathon focused on AI solutions.</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Code Sprint</td>
                      <td className="px-6 py-4 text-gray-600">Dec 05, 2024</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Approved</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">Competitive programming challenge.</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Web Dev Bootcamp</td>
                      <td className="px-6 py-4 text-gray-600">Jan 15, 2025</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Pending</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">A full-day intensive workshop on modern web tech.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
