import { User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'

export default function ClubHeadProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Club Head Profile</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={48} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{user?.name || 'Club Head User'}</h3>
                <p className="text-gray-600 mb-1">{user?.email}</p>
                <p className="text-gray-600">Head of {user?.clubName || 'a Club'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
              <p>Club Head specific details and settings will be built here soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
