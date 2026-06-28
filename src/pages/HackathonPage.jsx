import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useEventStore } from '../store/eventStore'
import Navbar from '../components/Navbar'
import { Calendar, Clock, Users, Trophy, Search, X, SlidersHorizontal, ChevronRight, Check } from 'lucide-react'
import { format, isValid, isAfter, isBefore, addDays } from 'date-fns'

function safeFormat(dateStr, fmt = 'MMM dd, yyyy') {
  if (!dateStr) return 'TBA'
  try {
    const d = new Date(dateStr)
    return isValid(d) ? format(d, fmt) : 'TBA'
  } catch { return 'TBA' }
}

export default function HackathonPage() {
  const { hackathons } = useHackathonStore()
  const eventStore = useEventStore()
  const events = eventStore.events
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    category: 'All', // 'All' or 'Hackathon'
    domains: [],
    mode: [],
    teamSize: [],
    status: [],
    club: [],
    sortBy: 'Newest'
  })

  const [domainSearch, setDomainSearch] = useState('')

  useEffect(() => {
    eventStore.fetchEvents?.()
  }, [])

  // Merge real events that have category === 'Hackathon' and are approved
  const eventHackathons = useMemo(() =>
    (events || [])
      .filter(e => e.category === 'Hackathon' && e.status === 'approved')
      .map(e => ({
        id:          `ev-${e.id || e._id}`,
        realId:      e.id || e._id,
        title:       e.title,
        description: e.shortDescription || e.description,
        date:        e.startDate || e.date,
        deadline:    e.registrationDeadlineDate,
        deadlineTime: e.registrationDeadlineTime,
        teamSizeRaw: e.maxTeamSize,
        teamSizeStr: e.maxTeamSize ? (e.maxTeamSize === 1 ? 'Individual' : `Up to ${e.maxTeamSize}`) : (e.participationType === 'Team' ? 'Team' : 'Individual'),
        tags:        e.tags || [],
        location:    e.location,
        mode:        e.mode || 'Offline',
        participants: e.attendees || 0,
        createdAt:   e.createdAt,
        bannerImage: e.bannerImage,
        problemStatementPdf: e.problemStatementPdf,
        club:        e.club,
        source:      'event'
      })),
  [events])

  // Also include mock hackathons from hackathonStore
  const storeHackathons = (hackathons || []).map(h => ({
    id:          `st-${h.id}`,
    realId:      h.id,
    title:       h.title,
    description: h.description,
    date:        h.date,
    deadline:    h.deadline,
    teamSizeStr: h.teamSize,
    teamSizeRaw: h.teamSize?.toLowerCase().includes('individual') ? 1 : 4,
    tags:        h.domain ? [h.domain] : [],
    location:    h.college,
    mode:        h.mode || 'Online',
    prize:       h.prize,
    participants: h.participants || 0,
    createdAt:   h.createdAt || h.date, // fallback
    club:        'Mock Club',
    source:      'store'
  }))

  const all = [...eventHackathons, ...storeHackathons]

  // Extract all possible domains and clubs for filter options
  const allDomains = useMemo(() => {
    const tags = new Set()
    all.forEach(h => h.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [all])
  
  const allClubs = useMemo(() => {
    const clubs = new Set()
    all.forEach(h => { if(h.club) clubs.add(h.club) })
    return Array.from(clubs).sort()
  }, [all])

  // Check conditions
  const getTeamSizeCategory = (rawSize, strSize) => {
    if (rawSize === 1 || (strSize && strSize.toLowerCase().includes('individual'))) return 'Individual'
    if (rawSize >= 2 && rawSize <= 4) return '2–4 Members'
    if (rawSize >= 5) return '5+ Members'
    return '2–4 Members' // fallback
  }

  const getStatusCategory = (h) => {
    const now = new Date()
    const deadline = h.deadline ? new Date(h.deadline) : null
    const eventDate = h.date ? new Date(h.date) : null
    
    if (deadline && isBefore(deadline, now)) return 'Closed'
    if (deadline && isBefore(deadline, addDays(now, 3))) return 'Closing Soon'
    if (eventDate && isAfter(eventDate, now)) return 'Upcoming'
    return 'Open'
  }

  // Filtering Logic
  const filtered = useMemo(() => {
    let result = all.filter(h => {
      // 1. Search Bar
      const matchSearch = !search || 
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        (h.description || '').toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      // 2. Category
      if (filters.category === 'Hackathon' && h.source !== 'event') return false

      // 3. Domains (OR logic inside domains)
      if (filters.domains.length > 0) {
        const hasDomain = h.tags?.some(t => filters.domains.includes(t))
        if (!hasDomain) return false
      }

      // 4. Mode
      if (filters.mode.length > 0) {
        const hMode = h.mode?.toLowerCase() || ''
        const modeMatch = filters.mode.some(m => hMode.includes(m.toLowerCase()))
        if (!modeMatch) return false
      }

      // 5. Team Size
      if (filters.teamSize.length > 0) {
        const cat = getTeamSizeCategory(h.teamSizeRaw, h.teamSizeStr)
        if (!filters.teamSize.includes(cat)) return false
      }

      // 6. Status
      if (filters.status.length > 0) {
        const stat = getStatusCategory(h)
        if (!filters.status.includes(stat)) return false
      }

      // 7. Club
      if (filters.club.length > 0) {
        if (!filters.club.includes(h.club)) return false
      }

      return true
    })

    // Sorting Logic
    result.sort((a, b) => {
      if (filters.sortBy === 'Newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      } else if (filters.sortBy === 'Registration Deadline') {
        const da = a.deadline ? new Date(a.deadline) : new Date(8640000000000000)
        const db = b.deadline ? new Date(b.deadline) : new Date(8640000000000000)
        return da - db
      } else if (filters.sortBy === 'Event Date') {
        const da = a.date ? new Date(a.date) : new Date(8640000000000000)
        const db = b.date ? new Date(b.date) : new Date(8640000000000000)
        return da - db
      } else if (filters.sortBy === 'Most Popular') {
        return (b.participants || 0) - (a.participants || 0)
      }
      return 0
    })

    return result
  }, [all, search, filters])

  // Count active filters
  const activeFiltersCount = 
    (filters.category !== 'All' ? 1 : 0) + 
    filters.domains.length + 
    filters.mode.length + 
    filters.teamSize.length + 
    filters.status.length + 
    filters.club.length

  const toggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const arr = prev[field]
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...arr, value] }
      }
    })
  }

  const removeFilter = (field, value) => {
    if (field === 'category') setFilters(prev => ({ ...prev, category: 'All' }))
    else setFilters(prev => ({ ...prev, [field]: prev[field].filter(v => v !== value) }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: 'All',
      domains: [],
      mode: [],
      teamSize: [],
      status: [],
      club: [],
      sortBy: 'Newest'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-900 text-white shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={36} className="text-blue-200" />
            <h1 className="text-4xl font-extrabold tracking-tight">Hackathons</h1>
          </div>
          <p className="text-blue-100 text-lg mb-8 max-w-xl">
            Build, compete, and collaborate. Find the perfect hackathon for your skills.
          </p>

          {/* Search and Filters Toggle */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-md transition-shadow"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(true)}
              className="px-5 py-3.5 bg-white text-gray-800 rounded-xl shadow-md font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Active Filter Chips Row */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 max-w-3xl">
              <span className="text-sm font-medium text-blue-100 mr-1">Active:</span>
              
              {filters.category !== 'All' && (
                <Chip label={filters.category} onRemove={() => removeFilter('category', filters.category)} />
              )}
              {filters.domains.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('domains', v)} />)}
              {filters.mode.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('mode', v)} />)}
              {filters.teamSize.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('teamSize', v)} />)}
              {filters.status.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('status', v)} />)}
              {filters.club.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('club', v)} />)}
              
              <button onClick={clearAllFilters} className="text-sm text-blue-200 hover:text-white underline underline-offset-2 ml-2">
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Results count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> hackathon{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort by:</span>
            <span className="font-semibold text-gray-800">{filters.sortBy}</span>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <Trophy size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No hackathons found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="mt-4 px-6 py-2 bg-primary-50 text-primary-600 font-medium rounded-lg hover:bg-primary-100 transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(h => <HackathonCard key={h.id} hackathon={h} />)}
          </div>
        )}
      </div>

      {/* Side Drawer Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform border-l">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary-600" />
                Filters
              </h2>
              <button onClick={() => setShowFilters(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Drawer Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              
              {/* Sort By */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Sort By</h3>
                <div className="space-y-2">
                  {['Newest', 'Registration Deadline', 'Event Date', 'Most Popular'].map(sort => (
                    <label key={sort} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.sortBy === sort ? 'border-primary-600 bg-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}>
                        {filters.sortBy === sort && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-gray-700 text-sm group-hover:text-gray-900">{sort}</span>
                      <input type="radio" className="hidden" checked={filters.sortBy === sort} onChange={() => setFilters(p => ({...p, sortBy: sort}))} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Category</h3>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  {['All', 'Hackathon'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters(p => ({...p, category: cat}))}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${filters.category === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Domains (Searchable Multi-select) */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                  Domains
                  {filters.domains.length > 0 && <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">{filters.domains.length}</span>}
                </h3>
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search domains..."
                    value={domainSearch}
                    onChange={e => setDomainSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {allDomains.filter(d => d.toLowerCase().includes(domainSearch.toLowerCase())).map(domain => (
                    <Checkbox
                      key={domain}
                      label={domain}
                      checked={filters.domains.includes(domain)}
                      onChange={() => toggleArrayFilter('domains', domain)}
                    />
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Mode</h3>
                <div className="space-y-2">
                  {['Online', 'Offline', 'Hybrid'].map(m => (
                    <Checkbox key={m} label={m} checked={filters.mode.includes(m)} onChange={() => toggleArrayFilter('mode', m)} />
                  ))}
                </div>
              </div>

              {/* Team Size */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Team Size</h3>
                <div className="space-y-2">
                  {['Individual', '2–4 Members', '5+ Members'].map(ts => (
                    <Checkbox key={ts} label={ts} checked={filters.teamSize.includes(ts)} onChange={() => toggleArrayFilter('teamSize', ts)} />
                  ))}
                </div>
              </div>

              {/* Registration Status */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Status</h3>
                <div className="space-y-2">
                  {['Open', 'Closing Soon', 'Upcoming'].map(st => (
                    <Checkbox key={st} label={st} checked={filters.status.includes(st)} onChange={() => toggleArrayFilter('status', st)} />
                  ))}
                </div>
              </div>
              
              {/* Club / Organizer */}
              {allClubs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                    Organizer
                    {filters.club.length > 0 && <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">{filters.club.length}</span>}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {allClubs.map(club => (
                      <Checkbox key={club} label={club} checked={filters.club.includes(club)} onChange={() => toggleArrayFilter('club', club)} />
                    ))}
                  </div>
                </div>
              )}

            </div>
            
            {/* Drawer Footer */}
            <div className="p-5 border-t bg-gray-50 flex gap-3 shrink-0">
              <button 
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/20 text-white rounded-full text-sm font-medium transition-colors cursor-pointer group" onClick={onRemove}>
      {label}
      <X size={14} className="opacity-70 group-hover:opacity-100" />
    </span>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-primary-600 border-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}>
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-gray-700 text-sm group-hover:text-gray-900 leading-snug">{label}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    </label>
  )
}

function HackathonCard({ hackathon: h }) {
  const isDeadlineSoon = h.deadline && (new Date(h.deadline) - new Date()) < 3 * 24 * 60 * 60 * 1000

  return (
    <Link to={`/hackathons/${h.realId}`} className="block group h-full">
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md hover:border-primary-300 transition-all h-full flex flex-col overflow-hidden">

        {/* Banner */}
        {h.bannerImage ? (
          <img src={h.bannerImage} alt={h.title} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-14 bg-gradient-to-r from-primary-500 to-blue-700" />
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
              {h.title}
            </h3>
            <Trophy size={20} className="text-yellow-500 shrink-0 mt-0.5" />
          </div>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{h.description}</p>

          {/* Key info */}
          <div className="space-y-1.5 mb-4 text-sm">
            {h.date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-primary-500 shrink-0" />
                <span>{safeFormat(h.date)}</span>
              </div>
            )}
            {h.deadline && (
              <div className={`flex items-center gap-2 ${isDeadlineSoon ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                <Clock size={14} className={`shrink-0 ${isDeadlineSoon ? 'text-red-500' : 'text-primary-500'}`} />
                <span>Deadline: {safeFormat(h.deadline)}{isDeadlineSoon ? ' ⚡ Soon!' : ''}</span>
              </div>
            )}
            {h.teamSizeStr && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={14} className="text-primary-500 shrink-0" />
                <span>Team: {h.teamSizeStr}</span>
              </div>
            )}
            {h.location && (
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <span>📍 {h.location}{h.mode ? ` · ${h.mode}` : ''}</span>
              </div>
            )}
            {h.prize && (
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                <span>🏆 {h.prize}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {h.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {h.tags.slice(0, 4).map(t => (
                <span key={t} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-100">
                  {t}
                </span>
              ))}
            </div>
          )}

          {h.club && (
            <p className="text-xs text-gray-400 mt-auto">by {h.club}</p>
          )}

          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 flex items-center">
              View Details <ChevronRight size={16} />
            </span>
            {h.problemStatementPdf && (
              <a href={h.problemStatementPdf} download={`${h.title.replace(/\s+/g, '_')}_Problem_Statement.pdf`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 transition">
                📄 PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
