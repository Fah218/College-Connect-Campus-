import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Tag } from 'lucide-react'
import { format } from 'date-fns'

export default function EventCard({ event, onRegister, isRegistered }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
          {event.category}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          {event.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} />
          {event.attendees || 0}/{event.capacity} attendees
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags?.map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1">
            <Tag size={12} />
            {tag}
          </span>
        ))}
      </div>
      
      {onRegister && (
        isRegistered ? (
          <button
            disabled
            className="w-full py-2 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
          >
            Registered
          </button>
        ) : (
          <Link
            to={`/events/${event.id || event._id}/register`}
            className="block w-full py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 text-center"
          >
            Register Now
          </Link>
        )
      )}
    </div>
  )
}
