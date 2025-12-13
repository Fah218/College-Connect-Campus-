import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useRecommendationStore } from '../store/recommendationStore'
import Navbar from '../components/Navbar'
import { Calendar, MapPin, Users, Trophy, Filter, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

export default function HackathonPage() {
  const { hackathons } = useHackathonStore()
  const { getRecommendedHackathons } = useRecommendationStore()
  const [filter, setFilter] = useState({ domain: 'all', search: '' })
  
  const recommendedHackathons = getRecommendedHackathons(hackathons)
  
  const domains = ['all', ...new Set(hackathons.map(h => h.domain))]
  
  const filteredHackathons = hackathons.filter(h => {
    const matchesDomain = filter.domain === 'all' || h.domain === filter.domain
    const matchesSearch = h.title.toLowerCase().includes(filter.search.toLowerCase())
    return matchesDomain && matchesSearch
  })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hackathons</h1>
          <p className="text-gray-600">Discover and participate in exciting hackathons</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} />
              <span className="font-medium">Filters:</span>
            </div>
            
            <select
              value={filter.domain}
              onChange={(e) => setFilter({ ...filter, domain: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain === 'all' ? 'All Domains' : domain}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Search hackathons..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="px-4 py-2 border rounded-lg flex-1 min-w-[200px]"
            />
          </div>
        </div>
        
        {/* Recommended Hackathons */}
        {recommendedHackathons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold">Recommended for You</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedHackathons.map(hackathon => (
                <div key={hackathon.id}>
                  <HackathonCard hackathon={hackathon} />
                  {hackathon.recommendationReasons?.length > 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium mb-1">Why recommended:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {hackathon.recommendationReasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Hackathons */}
        {/* <h2 className="text-2xl font-bold mb-4">All Hackathons</h2> */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map(hackathon => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
        
        {filteredHackathons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hackathons found matching your filters
          </div>
        )}
      </div>
    </div>
  )
}

function HackathonCard({ hackathon }) {
  const summary = `This hackathon focuses on ${hackathon.domain} and requires ${hackathon.teamSize} members per team.`
  
  return (
    <Link to={`/hackathons/${hackathon.id}`}>
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{hackathon.title}</h3>
          <Trophy className="text-yellow-500" size={24} />
        </div>
        
        {/* AI Summary */}
        <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
          🤖 {summary}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            {format(new Date(hackathon.date), 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            {hackathon.college}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            Team Size: {hackathon.teamSize}
          </div>
        </div>
        
        <div className="mb-4">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
            {hackathon.domain}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{hackathon.description}</p>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Prize Pool</span>
            <span className="font-semibold text-green-600">{hackathon.prize}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
