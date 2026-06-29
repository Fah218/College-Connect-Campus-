import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useHackathonStore } from '../store/hackathonStore'
import { GraduationCap, LogOut, User } from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { isAuthenticated, user, logout, addNotification } = useAuthStore()
  const store = useHackathonStore()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const syncedNotifIds = useRef(new Set())

  // Global Sync: Hackathon Store Notifs -> Auth Store Navbar Bell
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    const allNotifs = store.getUserNotifications?.(user.id) || []
    if (allNotifs.length === 0) return

    allNotifs.forEach(n => {
      if (!n.read && !syncedNotifIds.current.has(n.id)) {
        syncedNotifIds.current.add(n.id)
        addNotification({
          title: n.type === 'join_request' ? '🔔 New Join Request' : '✅ Team Request Accepted',
          message: n.text,
          priority: 'high',
          id: n.id
        })
        store.markUserNotifRead?.(user.id, n.id)
      }
    })
  }, [store.userNotifications, user?.id, isAuthenticated])

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
                    onClick={() => {
                      if (user?.role === 'admin' || user?.role === 'Admin') navigate('/admin/profile')
                      else if (user?.role === 'club_head' || user?.role === 'ClubHead') navigate('/club-head/profile')
                      else navigate('/student/profile')
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                    <span className="text-sm font-medium">{user?.name}</span>
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

    </>
  )
}
