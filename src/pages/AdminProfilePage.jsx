import { useState } from 'react'
import { User, Users, Calendar, ShieldCheck, Activity, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import ProfileEditForm from '../components/ProfileEditForm'

export default function AdminProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  
  const growthData = [
    { month: 'Sep', participants: 120 },
    { month: 'Oct', participants: 250 },
    { month: 'Nov', participants: 380 },
    { month: 'Dec', participants: 450 },
    { month: 'Jan', participants: 600 }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Admin Profile</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {isEditing && <ProfileEditForm onCancel={() => setIsEditing(false)} />}
            
            {/* 👤 Basic Info */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck size={48} className="text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{user?.name || 'Admin User'}</h3>
                <p className="text-gray-600 mb-1 flex items-center gap-2">
                  {user?.email} {user?.phone && <span>• {user.phone}</span>}
                </p>
                <p className="text-red-600 font-medium bg-red-50 inline-block px-3 py-1 rounded-full text-sm">Role: Administrator</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 shrink-0"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>

            {/* System Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <StatBox icon={Users} label="Total Users" value="1,240" color="blue" />
                <StatBox icon={Calendar} label="Total Events" value="156" color="purple" />
                <StatBox icon={ShieldCheck} label="Total Club Heads" value="24" color="indigo" />
              </div>
            </div>
            
            {/* 📈 Approval Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📈 Approval Insights</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-800 mb-1">342</p>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-green-700 mb-1">280</p>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                  <XCircle className="mx-auto text-red-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-red-700 mb-1">45</p>
                  <p className="text-sm text-red-600">Rejected</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                  <Clock className="mx-auto text-orange-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-orange-700 mb-1">17</p>
                  <p className="text-sm text-orange-600">Pending</p>
                </div>
              </div>
            </div>
            
            {/* 👥 Participation Overview & Activity Summary */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* 👥 Participation Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">👥 Participation Overview</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-4 text-center">
                  <p className="text-sm text-blue-600 mb-1">Total Student Participation</p>
                  <p className="text-4xl font-bold text-blue-700">8,450</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Growth Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="participants" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* 🧾 Activity Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">🧾 Activity Summary</h3>
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      Recent Approvals
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li>• Annual Tech Fest (Tech Club) - <span className="text-gray-400">2h ago</span></li>
                      <li>• AI Workshop Series (AI Club) - <span className="text-gray-400">5h ago</span></li>
                      <li>• Coding Competition (Coding Club) - <span className="text-gray-400">1d ago</span></li>
                    </ul>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <XCircle size={18} className="text-red-500" />
                      Recent Rejections
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li>• Midnight Gaming Tournament - <span className="text-gray-400">Justification needed</span></li>
                    </ul>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Activity size={18} className="text-indigo-500" />
                      Clubs Managed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">24 Active Clubs</span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">3 Pending Registration</span>
                    </div>
                  </div>
                </div>
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
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }
  
  return (
    <div className="bg-gray-50 border rounded-lg p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  )
}
