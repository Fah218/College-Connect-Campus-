const fs = require('fs');
const file = 'src/store/recommendationStore.js';
let content = fs.readFileSync(file, 'utf8');

const target2 = `  getRecommendedHackathons: (hackathons) => {
    const { userPreferences } = get()
    
    return hackathons.map(hackathon => {
      let score = 0
      let reasons = []
      
      // Domain matching
      if (userPreferences.domains.some(d => 
        hackathon.domain.toLowerCase().includes(d.toLowerCase())
      )) {
        score += 3
        reasons.push(\`Matches your \${hackathon.domain} expertise\`)
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
  },`;

const replacement2 = `  getRecommendedHackathons: (hackathons) => {
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
        reasons.push(\`Matches your interests: \${matchingDomains.join(', ')}\`)
      }
      
      // Skill matching
      const matchingSkills = userPreferences.skills.filter(skill =>
        hackathon.description?.toLowerCase().includes(skill.toLowerCase()) || 
        hackathon.tags?.some(t => t.toLowerCase().includes(skill.toLowerCase()))
      )
      if (matchingSkills.length > 0) {
        score += 2
        reasons.push(\`Matches your skills: \${matchingSkills.join(', ')}\`)
      }

      // Newness
      const createdAt = hackathon.createdAt ? new Date(hackathon.createdAt) : null
      if (createdAt && (now - createdAt) < 7 * 24 * 60 * 60 * 1000) {
        score += 1
        reasons.push(\`Newly announced event\`)
      }
      
      // Popularity
      if (hackathon.participants > 30 || (hackathon.teams && hackathon.teams.length > 5)) {
        score += 1
        reasons.push(\`High student participation\`)
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
  },`;

content = content.replace(target2, replacement2);
fs.writeFileSync(file, content);
console.log("Patched getRecommendedHackathons");
