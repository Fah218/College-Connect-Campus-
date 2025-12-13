import { create } from 'zustand'

export const useAnalyticsStore = create((set, get) => ({
  generateInsights: (events) => {
    const insights = []
    
    // Most active club
    const clubCounts = events.reduce((acc, event) => {
      acc[event.club] = (acc[event.club] || 0) + 1
      return acc
    }, {})
    
    const mostActiveClub = Object.entries(clubCounts)
      .sort(([, a], [, b]) => b - a)[0]
    
    if (mostActiveClub) {
      insights.push({
        id: 1,
        type: 'club',
        title: 'Most Active Club',
        message: `${mostActiveClub[0]} is the most active club with ${mostActiveClub[1]} events this month.`,
        icon: 'trophy',
        color: 'green'
      })
    }
    
    // Attendance trends
    const avgAttendance = events.reduce((sum, e) => sum + (e.attendees || 0), 0) / events.length
    const highAttendanceEvents = events.filter(e => e.attendees > avgAttendance).length
    
    insights.push({
      id: 2,
      type: 'attendance',
      title: 'Attendance Trend',
      message: `${highAttendanceEvents} events exceeded average attendance of ${Math.round(avgAttendance)} participants.`,
      icon: 'trending-up',
      color: 'blue'
    })
    
    // Domain popularity
    const domainCounts = {}
    events.forEach(event => {
      event.domains?.forEach(domain => {
        domainCounts[domain] = (domainCounts[domain] || 0) + (event.attendees || 0)
      })
    })
    
    const topDomain = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)[0]
    
    if (topDomain) {
      insights.push({
        id: 3,
        type: 'domain',
        title: 'Popular Domain',
        message: `${topDomain[0]} events have the highest participation with ${topDomain[1]} total attendees.`,
        icon: 'star',
        color: 'purple'
      })
    }
    
    // Approval rate
    const approvedCount = events.filter(e => e.status === 'approved').length
    const approvalRate = ((approvedCount / events.length) * 100).toFixed(0)
    
    insights.push({
      id: 4,
      type: 'approval',
      title: 'Approval Rate',
      message: `${approvalRate}% of submitted events were approved, showing strong event quality.`,
      icon: 'check-circle',
      color: 'green'
    })
    
    return insights
  },
  
  predictAttendance: (event, historicalEvents) => {
    // Simple prediction based on similar events
    const similarEvents = historicalEvents.filter(e => 
      e.category === event.category && e.status === 'approved'
    )
    
    if (similarEvents.length === 0) return { predicted: 50, confidence: 'low' }
    
    const avgAttendance = similarEvents.reduce((sum, e) => sum + e.attendees, 0) / similarEvents.length
    const confidence = similarEvents.length > 5 ? 'high' : similarEvents.length > 2 ? 'medium' : 'low'
    
    return {
      predicted: Math.round(avgAttendance),
      confidence,
      basedOn: similarEvents.length
    }
  },
  
  predictApprovalSuccess: (event) => {
    let score = 50 // Base score
    
    // Factors that increase approval probability
    if (event.description?.length > 50) score += 15
    if (event.capacity && event.capacity <= 100) score += 10
    if (event.collaboratingClubs?.length > 0) score += 10
    if (event.tags?.length >= 3) score += 10
    
    const probability = Math.min(score, 95)
    const confidence = probability > 75 ? 'high' : probability > 50 ? 'medium' : 'low'
    
    return { probability, confidence }
  }
}))
