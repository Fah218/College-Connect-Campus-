import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { format, parseISO, isBefore, isAfter, addDays } from 'date-fns'

export default function Timeline({ events, userRole, onEventClick }) {
  const now = new Date()
  
  const timelineItems = events
    .filter(e => {
      if (userRole === 'admin') return true
      if (userRole === 'club_head') return true
      return e.status === 'approved'
    })
    .map(event => {
      const dateStr = event.date || event.startDate || event.createdAt || new Date().toISOString();
      let eventDate = new Date(); // Fallback to current date
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed;
        }
      }
      
      const isUpcoming = isAfter(eventDate, now)
      const isPast = isBefore(eventDate, now)
      const isToday = format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      
      let status = 'upcoming'
      let icon = Calendar
      let color = 'green'
      
      if (isPast) {
        status = 'completed'
        icon = CheckCircle
        color = 'gray'
      } else if (isToday) {
        status = 'ongoing'
        icon = Clock
        color = 'blue'
      } else if (event.status === 'pending') {
        status = 'pending'
        icon = AlertCircle
        color = 'yellow'
      }
      
      return {
        ...event,
        eventDate,
        status,
        icon,
        color,
        sortDate: eventDate.getTime()
      }
    })
    .sort((a, b) => a.sortDate - b.sortDate)

  console.log("Timeline render", {
    eventsLength: events?.length,
    timelineItemsLength: timelineItems.length
  });
  
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-300',
      green: 'bg-green-100 text-green-600 border-green-300',
      orange: 'bg-orange-100 text-orange-600 border-orange-300',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-300'
    }
    return colors[color] || colors.blue
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold mb-6">Timeline View</h2>
      
      <div className="space-y-4">
        {timelineItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getColorClasses(item.color)}`}>
                  <Icon size={20} />
                </div>
                {index < timelineItems.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 my-2" />
                )}
              </div>
              
              <div 
                className="flex-1 pb-8 cursor-pointer hover:opacity-80 transition"
                onClick={() => onEventClick && onEventClick(item)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.club}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getColorClasses(item.color)}`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{format(item.eventDate, 'EEEE, MMMM dd, yyyy')}{item.time ? ` at ${item.time}` : ' (Time TBA)'}</p>
                  <p className="text-gray-500">{item.location || 'Location TBA'}</p>
                  
                  {userRole === 'admin' && item.status === 'pending' && (
                    <p className="text-orange-600 mt-2">⚠️ Awaiting approval</p>
                  )}
                  
                  {userRole === 'club_head' && item.status === 'pending' && (
                    <p className="text-orange-600 mt-2">⏳ Pending admin approval</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {(() => {
        if (timelineItems.length === 0) {
          console.log("Rendering empty state");
          return (
            <div className="text-center py-8 text-gray-500">
              No events in timeline
            </div>
          );
        }
        return null;
      })()}
    </div>
  )
}
