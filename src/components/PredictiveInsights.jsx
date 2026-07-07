import { TrendingUp, Target, Award } from 'lucide-react'
import { useAnalyticsStore } from '../store/analyticsStore'

export default function PredictiveInsights({ event, historicalEvents }) {
  const { predictAttendance, predictApprovalSuccess } = useAnalyticsStore()
  
  const attendancePrediction = predictAttendance?.(event, historicalEvents)
  const approvalPrediction = predictApprovalSuccess?.(event)
  
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-purple-600" size={24} />
        <h3 className="text-lg font-semibold">Predictive Insights</h3>
      </div>
      
      <div className="space-y-4">
        {/* Attendance Prediction */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="text-blue-600" size={20} />
              <h4 className="font-medium">Expected Attendance</h4>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(attendancePrediction.confidence)}`}>
              {attendancePrediction.confidence} confidence
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">
            ~{attendancePrediction.predicted} participants
          </p>
          <p className="text-xs text-gray-600">
            Based on {attendancePrediction.basedOn} similar events
          </p>
        </div>
        
        {/* Approval Prediction */}
        {event.status === 'pending' && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="text-green-600" size={20} />
                <h4 className="font-medium">Approval Probability</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(approvalPrediction.confidence)}`}>
                {approvalPrediction.confidence} confidence
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {approvalPrediction.probability}%
            </p>
            <p className="text-xs text-gray-600">
              Likelihood of admin approval
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
