const fs = require('fs');
const file = 'src/store/recommendationStore.js';
let content = fs.readFileSync(file, 'utf8');

const target = `  getRecommendedEvents: (events, registeredEvents) => {
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
          reasons.push(\`Matches your interest in \${domainList.join(', ')}\`)
        }
        
        // Club matching
        if (userPreferences.clubs.includes(event.club)) {
          score += 2
          reasons.push(\`From \${event.club} which you follow\`)
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
          reasons.push(\`You attended \${event.club} events before\`)
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
  },`;

const replacement = `  getRecommendedEvents: (events, registeredEvents) => {
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
          reasons.push(\`Matches your interests: \${matchingDomains.join(', ')}\`)
        }
        
        // Club matching
        if (userPreferences.clubs.includes(event.club)) {
          score += 2
          reasons.push(\`Organized by a club you follow (\${event.club})\`)
        }
        
        // Skills / Tag matching
        const matchingSkills = (event.tags || []).filter(t => 
          userPreferences.skills.some(s => t.toLowerCase().includes(s.toLowerCase()))
        )
        if (matchingSkills.length > 0) {
          score += 2
          reasons.push(\`Matches your skills: \${matchingSkills.join(', ')}\`)
        }
        
        // Past registration pattern
        const sameClubRegistered = registeredEvents.some(reg => {
          // reg can be an ID or an event object
          const regEvent = typeof reg === 'object' ? reg : events.find(e => e.id === reg || e._id === reg)
          return regEvent?.club === event.club
        })
        if (sameClubRegistered) {
          score += 2
          reasons.push(\`You participated in similar events before\`)
        }

        // Popularity / trending
        if (event.attendees > 50) {
          score += 1
          reasons.push(\`High student participation\`)
        }

        // Newness
        const createdAt = event.createdAt ? new Date(event.createdAt) : null
        if (createdAt && (now - createdAt) < 7 * 24 * 60 * 60 * 1000) {
          score += 1
          reasons.push(\`Newly announced event\`)
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
  },`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Patched getRecommendedEvents");
