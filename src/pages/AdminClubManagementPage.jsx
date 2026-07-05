import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClubStore } from '../store/clubStore'
import Navbar from '../components/Navbar'
import { ArrowLeft, Users, Calendar, Shield } from 'lucide-react'

export default function AdminClubManagementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clubs, fetchClubs, toggleArchiveStatus } = useClubStore()

  useEffect(() => {
    fetchClubs()
  }, [])

  const club = clubs.find(c => String(c.id || c.name) === String(id))

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Club not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Shield size={16} /> Headed by {club.head || 'Unknown'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              club.isArchived ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {club.isArchived ? 'Archived' : 'Active'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3 text-gray-700 mb-2">
                <Users size={20} className="text-blue-500" />
                <h3 className="font-semibold">Registered Members</h3>
              </div>
              <p className="text-3xl font-bold">{club.members}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3 text-gray-700 mb-2">
                <Calendar size={20} className="text-purple-500" />
                <h3 className="font-semibold">Total Events</h3>
              </div>
              <p className="text-3xl font-bold">{club.events}</p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-lg font-bold mb-4">Admin Actions</h2>
            <button
              onClick={() => toggleArchiveStatus(club.id, !club.isArchived)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                club.isArchived 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {club.isArchived ? 'Unarchive Club' : 'Archive Club'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
