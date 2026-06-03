import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Tag, Bell, CalendarCheck, BellOff, CalendarX } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useCalendarStore, downloadICS } from '../store/calendarStore'

export default function EventCard({ event, onRegister, isRegistered }) {
  const { addReminder, addCalendarItem, removeReminder, removeCalendarItem, hasReminder, hasCalendarItem } = useCalendarStore()
  const [toast, setToast] = useState(null)

  const reminded   = hasReminder(event.id)
  const inCalendar = hasCalendarItem(event.id)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleReminder = () => {
    if (reminded) {
      removeReminder(event.id)
      showToast('Reminder removed.', 'info')
    } else {
      addReminder(event)
      showToast(`⏰ Reminder set for "${event.title}"!`)
    }
  }

  const handleAddToCalendar = () => {
    if (inCalendar) {
      removeCalendarItem(event.id)
      showToast('Removed from your calendar.', 'info')
    } else {
      addCalendarItem(event)
      downloadICS(event)           // triggers .ics download for Google/Apple/Outlook
      showToast(`📅 "${event.title}" added to your calendar!`)
    }
  }

  return (
    <div className="relative bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition flex flex-col">
      {/* Toast notification */}
      {toast && (
        <div className={`absolute top-3 right-3 left-3 z-10 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all
          ${toast.type === 'info' ? 'bg-gray-700 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 pr-2">{event.title}</h3>
        <span className="shrink-0 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
          {event.category}
        </span>
      </div>

      {/* Short or full description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {event.shortDescription || event.description}
      </p>

      {/* Event details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-primary-500" />
          {format(new Date(event.startDate || event.date), 'MMM dd, yyyy')} at {event.startTime || event.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-primary-500" />
          {event.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} className="text-primary-500" />
          {event.attendees || 0}/{event.maxParticipants || event.capacity || 'Unlimited'} attendees
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags?.map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1">
            <Tag size={12} />
            {tag}
          </span>
        ))}
      </div>

      {/* ── Calendar / Reminder Buttons ── */}
      <div className="flex gap-2 mb-3">
        {isRegistered ? (
          /* Case 2: Already registered → "Add to Calendar" */
          <button
            onClick={handleAddToCalendar}
            title={inCalendar ? 'Remove from calendar' : 'Add event date to your calendar'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition
              ${inCalendar
                ? 'bg-green-50 border-green-400 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                : 'border-green-400 text-green-700 hover:bg-green-50'}`}
          >
            {inCalendar ? <CalendarX size={15} /> : <CalendarCheck size={15} />}
            {inCalendar ? 'Remove from Calendar' : 'Add to Calendar'}
          </button>
        ) : (
          /* Case 1: Not registered → "Set Reminder" */
          <button
            onClick={handleReminder}
            title={reminded ? 'Remove reminder' : 'Remind me before registration deadline'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition
              ${reminded
                ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                : 'border-yellow-400 text-yellow-700 hover:bg-yellow-50'}`}
          >
            {reminded ? <BellOff size={15} /> : <Bell size={15} />}
            {reminded ? 'Reminder Set ✓' : 'Set Reminder'}
          </button>
        )}
      </div>

      {/* Registration deadline badge (if available) */}
      {event.registrationDeadlineDate && !isRegistered && (
        <p className="text-xs text-red-500 mb-3 font-medium">
          ⏳ Deadline: {format(new Date(event.registrationDeadlineDate), 'MMM dd, yyyy')}
          {event.registrationDeadlineTime && ` at ${event.registrationDeadlineTime}`}
        </p>
      )}

      {/* Register button */}
      {onRegister && (
        isRegistered ? (
          <button
            disabled
            className="w-full py-2 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
          >
            ✅ Registered
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
