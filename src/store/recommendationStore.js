import { create } from 'zustand'

export const useRecommendationStore = create((set, get) => ({
  userPreferences: {
    domains: ['AI', 'Web Development'],
    clubs: ['Tech Club', 'Coding Club'],
    skills: ['React', 'Python', 'Machine Learning']
  },
  
  getRecommendedEvents: (events, registeredEvents) => {
    const { userPreferences } = get()
    
    return events
      .filter(e => e.status === 'approved')
      .map(event => {
        let score = 0
        let reasons = []
        
        // Domain matching
        let domainList = []
        if (typeof event.domains === 'string') {
          domainList = event.domains.split(',').map(d => d.trim()).filter(Boolean)
        } else if (Array.isArray(event.domains)) {
          domainList = event.domains
        }

        const domainMatch = domainList.some(d => 
          userPreferences.domains.includes(d)
        )
        if (domainMatch) {
          score += 3
          reasons.push(`Matches your interest in ${domainList.join(', ')}`)
        }
        
        // Club matching
        if (userPreferences.clubs.includes(event.club)) {
          score += 2
          reasons.push(`From ${event.club} which you follow`)
        }
        
        // Tag matching
        const tagMatch = event.tags?.some(t => 
          userPreferences.skills.some(s => t.toLowerCase().includes(s.toLowerCase()))
        )
        if (tagMatch) {
          score += 2
          reasons.push('Matches your skill interests')
        }
        
        // Past registration pattern
        const sameClubRegistered = registeredEvents.some(regId => {
          const regEvent = events.find(e => e.id === regId)
          return regEvent?.club === event.club
        })
        if (sameClubRegistered) {
          score += 1
          reasons.push(`You attended ${event.club} events before`)
        }
        
        return {
          ...event,
          recommendationScore: score,
          recommendationReasons: reasons
        }
      })
      .filter(e => e.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6)
  },
  
  getRecommendedHackathons: (hackathons) => {
    const { userPreferences } = get()
    
    return hackathons.map(hackathon => {
      let score = 0
      let reasons = []
      
      // Domain matching
      if (userPreferences.domains.some(d => 
        hackathon.domain.toLowerCase().includes(d.toLowerCase())
      )) {
        score += 3
        reasons.push(`Matches your ${hackathon.domain} expertise`)
      }
      
      // Skill matching
      const skillMatch = userPreferences.skills.some(skill =>
        hackathon.description.toLowerCase().includes(skill.toLowerCase())
      )
      if (skillMatch) {
        score += 2
        reasons.push('Aligns with your technical skills')
      }
      
      return {
        ...hackathon,
        recommendationScore: score,
        recommendationReasons: reasons
      }
    })
    .filter(h => h.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 4)
  },
  
  updatePreferences: (preferences) => set({ userPreferences: preferences })
}))
