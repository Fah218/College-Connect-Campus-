import { TrendingUp, Trophy, Star, CheckCircle, AlertCircle } from 'lucide-react'

export default function InsightCard({ insight }) {
  const icons = {
    'trending-up': TrendingUp,
    'trophy': Trophy,
    'star': Star,
    'check-circle': CheckCircle,
    'alert': AlertCircle
  }
  
  const colors = {
    green: 'bg-green-100 text-green-600 border-green-300',
    blue: 'bg-blue-100 text-blue-600 border-blue-300',
    purple: 'bg-purple-100 text-purple-600 border-purple-300',
    orange: 'bg-orange-100 text-orange-600 border-orange-300'
  }
  
  const Icon = icons[insight.icon] || TrendingUp
  const colorClass = colors[insight.color] || colors.blue
  
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClass}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{insight.title}</h4>
          <p className="text-sm opacity-90">{insight.message}</p>
        </div>
      </div>
    </div>
  )
}
