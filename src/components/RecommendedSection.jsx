import { Sparkles } from 'lucide-react'
import EventCard from './EventCard'

export default function RecommendedSection({ recommendations, onRegister, registeredEvents }) {
  if (recommendations.length === 0) return null
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold">Recommended for You</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(event => (
          <div key={event.id} className="relative">
            <EventCard
              event={event}
              onRegister={onRegister}
              isRegistered={registeredEvents.includes(event.id)}
            />
            {event.recommendationReasons?.length > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-1">Why recommended:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {event.recommendationReasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
