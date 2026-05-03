import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { GraduationCap, LogOut, User } from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useState } from 'react'
import StudentProfile from './StudentProfile'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
              <GraduationCap size={28} />
              CampusConnect
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <User size={18} />
                    <span className="text-sm">{user?.name}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="px-4 py-2 text-primary-600 font-medium hover:text-primary-700">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showProfile && (
        <StudentProfile user={user} onClose={() => setShowProfile(false)} />
      )}
    </>
  )
}
