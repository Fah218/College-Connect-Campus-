import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useClubStore } from '../store/clubStore'
import Navbar from '../components/Navbar'
import { 
  ArrowLeft, Users, Calendar, Shield, 
  Activity, Target, CheckCircle, XCircle, Clock,
  Mail, Phone, BookOpen, Download, UserPlus
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts'
import ExportButton from '../components/ExportButton'

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminClubManagementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { adminClubAnalytics, fetchAdminClubAnalytics, isLoading } = useAnalyticsStore()
  const { toggleArchiveStatus } = useClubStore()

  useEffect(() => {
    fetchAdminClubAnalytics(id)
  }, [id])

  if (isLoading || !adminClubAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  const { club, statistics, charts, recentEvents, recentActivity } = adminClubAnalytics

  const handleArchiveToggle = async () => {
    await toggleArchiveStatus(club.id, !club.isArchived)
    fetchAdminClubAnalytics(id) // Refresh data
  }

  const exportData = recentEvents.map(e => ({
    "Event Title": e.title,
    "Category": e.category,
    "Status": e.status,
    "Date": e.date || e.startDate,
    "Total Registrations": e.totalRegistrations,
    "Total Participants": e.totalParticipants
  }))

  const fullReportData = [
    { Section: "Club Details", Key: "Club Name", Value: club.name },
    { Section: "Club Details", Key: "Club Head", Value: club.head },
    { Section: "Club Details", Key: "Email", Value: club.email },
    { Section: "Club Details", Key: "Phone", Value: club.phone || 'Not Provided' },
    { Section: "Statistics", Key: "Total Events", Value: statistics.totalEvents },
    { Section: "Statistics", Key: "Approved Events", Value: statistics.approvedEvents },
    { Section: "Statistics", Key: "Total Participants", Value: statistics.totalParticipants },
    { Section: "Statistics", Key: "Avg Participants/Event", Value: statistics.avgParticipants },
    ...recentEvents.map(e => ({ Section: "Recent Events", Key: e.title, Value: `Regs: ${e.totalRegistrations}, Parts: ${e.totalParticipants}` })),
    ...recentActivity.map(a => ({ Section: "Timeline", Key: a.title, Value: new Date(a.date).toLocaleDateString() }))
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div className="flex gap-3">
            <ExportButton data={fullReportData} filename={`${club.name}_full_report`} type="csv" />
            <ExportButton data={fullReportData} filename={`${club.name}_full_report`} type="pdf" />
          </div>
        </div>

        {/* Club Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 to-primary-100 rounded-bl-full opacity-50 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-extrabold text-gray-900">{club.name}</h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  club.isArchived ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {club.isArchived ? 'Archived' : 'Active'}
                </span>
              </div>
              <p className="text-gray-500 text-lg flex items-center gap-2 mt-2">
                {club.department && <><BookOpen size={18} /> Department of {club.department}</>}
              </p>
              <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-2"><Shield size={16} className="text-primary-500" /> Headed by {club.head} {club.designation && `(${club.designation})`}</span>
                <span className="flex items-center gap-2"><Mail size={16} className="text-primary-500" /> {club.email}</span>
                {club.phone && <span className="flex items-center gap-2"><Phone size={16} className="text-primary-500" /> {club.phone}</span>}
                <span className="flex items-center gap-2"><Calendar size={16} className="text-primary-500" /> Formed: {new Date(club.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex gap-3">
               <button
                  onClick={handleArchiveToggle}
                  className={`px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all border flex items-center gap-2 ${
                    club.isArchived 
                      ? 'bg-white text-green-600 border-green-200 hover:bg-green-50' 
                      : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                  }`}
                >
                  <Activity size={18} />
                  {club.isArchived ? 'Activate Club' : 'Archive Club'}
                </button>
                <button className="px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all border bg-white text-primary-600 border-primary-200 hover:bg-primary-50 flex items-center gap-2">
                  <UserPlus size={18} /> Reassign Head
                </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Events" value={statistics.totalEvents} icon={<Calendar />} color="blue" />
          <StatCard title="Approved Events" value={statistics.approvedEvents} icon={<CheckCircle />} color="green" />
          <StatCard title="Pending Events" value={statistics.pendingEvents} icon={<Clock />} color="yellow" />
          <StatCard title="Rejected Events" value={statistics.rejectedEvents} icon={<XCircle />} color="red" />
          
          <StatCard title="Total Registrations" value={statistics.totalRegistrations} icon={<Target />} color="purple" />
          <StatCard title="Unique Participants" value={statistics.uniqueStudents} icon={<Users />} color="indigo" />
          <StatCard title="Registered Teams" value={statistics.registeredTeams} icon={<Users />} color="pink" />
          <StatCard title="Avg. Participants/Event" value={statistics.avgParticipants} icon={<Activity />} color="teal" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content (Left, 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Club Analytics Charts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Activity className="text-primary-500" /> Club Analytics
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Event Creation Trend</h3>
                   <ResponsiveContainer width="100%" height={250}>
                     <LineChart data={charts.monthlyCreation}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                       <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                </div>
                
                <div>
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Event Approval Rate</h3>
                   <div className="flex items-center justify-center h-[250px]">
                     {statistics.totalEvents > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={charts.approvalRate}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={90}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {charts.approvalRate.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                         </PieChart>
                       </ResponsiveContainer>
                     ) : (
                       <p className="text-gray-400">No events yet.</p>
                     )}
                   </div>
                   <div className="flex justify-center gap-4 text-sm mt-[-10px]">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Approved</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> Pending</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Rejected</span>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t">
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Registrations & Participants Per Event</h3>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={charts.eventParticipationChart}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                     <Bar dataKey="registrations" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Registrations" />
                     <Bar dataKey="participants" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Participants" />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Events Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Calendar className="text-primary-500" /> Recent Events
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Event Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Regs / Parts</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentEvents.length > 0 ? recentEvents.map((event) => (
                      <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{event.date || event.startDate}</td>
                        <td className="px-6 py-4 text-center text-sm font-medium">
                          {event.totalRegistrations} / <span className="text-primary-600">{event.totalParticipants}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            event.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            event.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/admin/events/${event._id}`)}
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No events found for this club.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar (Right, 1 col) */}
          <div className="space-y-8">
            
            {/* Club Head Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
              <div className="relative pt-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md mb-4 border border-gray-200">
                  {club.profileImage ? (
                    <img src={club.profileImage} alt={club.head} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700">
                      {club.head.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{club.head}</h3>
                <p className="text-sm font-medium text-primary-600 mb-6">{club.designation || 'Club Head'} {club.department && `• ${club.department}`}</p>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{club.email}</span>
                  </div>
                  {club.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <Phone size={16} className="text-gray-400" />
                      <span>{club.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Activity className="text-primary-500" /> Recent Activity
              </h2>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                      activity.type === 'event_created' ? 'bg-blue-500 text-white' :
                      activity.type === 'event_approved' ? 'bg-green-500 text-white' :
                      activity.type === 'event_rejected' ? 'bg-red-500 text-white' :
                      activity.type === 'team_registration' ? 'bg-purple-500 text-white' :
                      'bg-indigo-500 text-white'
                    }`}>
                      {activity.type.includes('event') ? <Calendar size={16} /> : <Users size={16} />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 text-sm truncate">{activity.title}</div>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {new Date(activity.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No recent activity.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
  }
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-gray-500">{title}</h3>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight pl-1">{value}</p>
    </div>
  )
}
