import { create } from 'zustand'

export const useRecommendationStore = create((set, get) => ({
  userPreferences: {
    domains: ['AI', 'Web Development'],
    clubs: [],
    skills: ['React', 'Python', 'Machine Learning']
  },
  
  getRecommendedEvents: (events, registeredEvents) => {
    const { userPreferences } = get()
    const now = new Date()
    
    return events
      .filter(e => e.status === 'approved')
      .map(event => {
        let score = 0
        let reasons = []
        
        // Domain/Interests matching
        let domainList = []
        if (typeof event.domains === 'string') {
          domainList = event.domains.split(',').map(d => d.trim()).filter(Boolean)
        } else if (Array.isArray(event.domains)) {
          domainList = event.domains
        }
        const matchingDomains = domainList.filter(d => userPreferences.domains.includes(d))
        if (matchingDomains.length > 0) {
          score += 3
          reasons.push(`Matches your interests: ${matchingDomains.join(', ')}`)
        }
        
        // Club matching
        if (userPreferences.clubs.includes(event.club)) {
          score += 2
          reasons.push(`Organized by a club you follow (${event.club})`)
        }
        
        // Skills / Tag matching
        const matchingSkills = (event.tags || []).filter(t => 
          userPreferences.skills.some(s => t.toLowerCase().includes(s.toLowerCase()))
        )
        if (matchingSkills.length > 0) {
          score += 2
          reasons.push(`Matches your skills: ${matchingSkills.join(', ')}`)
        }
        
        // Past registration pattern
        const sameClubRegistered = registeredEvents.some(reg => {
          // reg can be an ID or an event object
          const regEvent = typeof reg === 'object' ? reg : events.find(e => e.id === reg || e._id === reg)
          return regEvent?.club === event.club
        })
        if (sameClubRegistered) {
          score += 2
          reasons.push(`You participated in similar events before`)
        }

        // Popularity / trending
        if (event.attendees > 50) {
          score += 1
          reasons.push(`High student participation`)
        }

        // Newness
        const createdAt = event.createdAt ? new Date(event.createdAt) : null
        if (createdAt && (now - createdAt) < 7 * 24 * 60 * 60 * 1000) {
          score += 1
          reasons.push(`Newly announced event`)
        }

        // Fallbacks if no personalized reasons
        if (reasons.length === 0) {
          if (event.attendees > 30) {
            reasons.push('Popular campus event')
          } else {
            reasons.push('Trending among students')
          }
          // We give a base score of 1 so it can still be recommended
          score += 1
        }
        
        return {
          ...event,
          recommendationScore: score,
          recommendationReasons: reasons.slice(0, 3) // Max 3 reasons
        }
      })
      .filter(e => e.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6)
  },
  
  getRecommendedHackathons: (hackathons) => {
    const { userPreferences } = get()
    const now = new Date()
    
    return hackathons.map(hackathon => {
      let score = 0
      let reasons = []
      
      // Domain matching
      const matchingDomains = userPreferences.domains.filter(d => 
        hackathon.domain?.toLowerCase().includes(d.toLowerCase())
      )
      if (matchingDomains.length > 0) {
        score += 3
        reasons.push(`Matches your interests: ${matchingDomains.join(', ')}`)
      }
      
      // Skill matching
      const matchingSkills = userPreferences.skills.filter(skill =>
        hackathon.description?.toLowerCase().includes(skill.toLowerCase()) || 
        hackathon.tags?.some(t => t.toLowerCase().includes(skill.toLowerCase()))
      )
      if (matchingSkills.length > 0) {
        score += 2
        reasons.push(`Matches your skills: ${matchingSkills.join(', ')}`)
      }

      // Newness
      const createdAt = hackathon.createdAt ? new Date(hackathon.createdAt) : null
      if (createdAt && (now - createdAt) < 7 * 24 * 60 * 60 * 1000) {
        score += 1
        reasons.push(`Newly announced event`)
      }
      
      // Popularity
      if (hackathon.participants > 30 || (hackathon.teams && hackathon.teams.length > 5)) {
        score += 1
        reasons.push(`High student participation`)
      }

      // Fallbacks
      if (reasons.length === 0) {
        reasons.push('Trending among students')
        score += 1
      }
      
      return {
        ...hackathon,
        recommendationScore: score,
        recommendationReasons: reasons.slice(0, 3)
      }
    })
    .filter(h => h.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 4)
  },
  
  updatePreferences: (preferences) => set({ userPreferences: preferences })
}))
