import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const { notifications, markNotificationRead } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300'
      case 'medium': return 'bg-yellow-100 border-yellow-300'
      default: return 'bg-blue-100 border-blue-300'
    }
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)}`}>
                    <p className="font-medium text-sm mb-1">{notification.title}</p>
                    <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
