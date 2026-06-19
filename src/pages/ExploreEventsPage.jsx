import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useRegistrationStore } from '../store/registrationStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import Timeline from '../components/Timeline'
import { Search, Filter, Calendar, MapPin, Tag, Layers, X, Monitor, List, Layout, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Hackathon', 'Competition']

export default function ExploreEventsPage() {
  const { events } = useEventStore()
  const { registrations } = useRegistrationStore()
  const { user } = useAuthStore()
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('All')
  const [clubFilter, setClubFilter]   = useState('All')
  const [dateFilter, setDateFilter]   = useState('')
  const [modeFilter, setModeFilter]   = useState('All')
  const [sortBy, setSortBy]           = useState('Newest')
  const [view, setView]               = useState('list')

  // Show all events (including pending) so creators can see them immediately
  const approved = useMemo(() => events, [events])

  // Derive unique club list from approved events
  const clubs = useMemo(() => {
    const names = ['All', ...new Set(approved.map(e => e.club).filter(Boolean))]
    return names
  }, [approved])

  const filtered = useMemo(() => {
    let result = approved.filter(event => {
      const matchCat   = category === 'All' || event.category === category
      const matchClub  = clubFilter === 'All' || event.club === clubFilter
      const matchDate  = !dateFilter || (event.startDate || event.date || '').startsWith(dateFilter)
      const matchSearch = !search || event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.shortDescription || event.description || '').toLowerCase().includes(search.toLowerCase())
      
      let matchMode = true
      if (modeFilter !== 'All') {
        const isOnline = /online|zoom|meet|teams|virtual|webex/i.test(event.location || '')
        if (modeFilter === 'Online') matchMode = isOnline
        if (modeFilter === 'Offline') matchMode = !isOnline
      }
      
      return matchCat && matchClub && matchDate && matchSearch && matchMode
    })

    result.sort((a, b) => {
      if (sortBy === 'Event Date') {
        return new Date(a.date || a.startDate || 0) - new Date(b.date || b.startDate || 0)
      }
      if (sortBy === 'Deadline Soon') {
        const aDeadline = a.registrationDeadlineDate ? new Date(a.registrationDeadlineDate).getTime() : Infinity
        const bDeadline = b.registrationDeadlineDate ? new Date(b.registrationDeadlineDate).getTime() : Infinity
        return aDeadline - bDeadline
      }
      if (sortBy === 'Most Popular') {
        return (b.totalParticipants || 0) - (a.totalParticipants || 0)
      }
      
      // Newest
      const aId = typeof a.id === 'number' ? a.id : (a._id ? parseInt(a._id.toString().slice(0,8), 16) : 0)
      const bId = typeof b.id === 'number' ? b.id : (b._id ? parseInt(b._id.toString().slice(0,8), 16) : 0)
      return bId - aId
    })

    return result
  }, [approved, category, clubFilter, dateFilter, search, modeFilter, sortBy])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setClubFilter('All')
    setDateFilter('')
    setModeFilter('All')
  }

  const hasActiveFilters = search || category !== 'All' || clubFilter !== 'All' || dateFilter || modeFilter !== 'All'

  const catCounts = useMemo(() => {
    return CATEGORIES.slice(1).reduce((acc, cat) => {
      acc[cat] = approved.filter(e => e.category === cat).length
      return acc
    }, {})
  }, [approved])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Explore Events</h1>
          <p className="text-primary-100 text-lg mb-8">
            Workshops, seminars, hackathons and more — all happening on your campus.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by name or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-800 shadow-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Category pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium text-sm border transition
                ${category === cat
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'}`}
            >
              {cat}
              {cat !== 'All' && catCounts[cat] > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs
                  ${category === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {catCounts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar Filters ── */}
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="bg-white rounded-xl border shadow-sm p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Filter size={16} /> Filters
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
                )}
              </div>

              {/* Club filter */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  <Layers size={12} className="inline mr-1" /> Club
                </label>
                <select
                  value={clubFilter}
                  onChange={e => setClubFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-400"
                >
                  {clubs.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Date filter */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  <Calendar size={12} className="inline mr-1" /> Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-400"
                />
                {dateFilter && (
                  <button onClick={() => setDateFilter('')} className="text-xs text-red-400 mt-1 hover:underline">Clear date</button>
                )}
              </div>

              {/* Mode filter */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  <Monitor size={12} className="inline mr-1" /> Event Mode
                </label>
                <select
                  value={modeFilter}
                  onChange={e => setModeFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-400"
                >
                  <option value="All">All Modes</option>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              {/* Active filters summary */}
              {hasActiveFilters && (
                <div className="border-t pt-4 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active</p>
                  {category !== 'All' && (
                    <span className="flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                      <Tag size={10} /> {category}
                    </span>
                  )}
                  {clubFilter !== 'All' && (
                    <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                      <Layers size={10} /> {clubFilter}
                    </span>
                  )}
                  {dateFilter && (
                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <Calendar size={10} /> {format(new Date(dateFilter), 'MMM d, yyyy')}
                    </span>
                  )}
                  {modeFilter !== 'All' && (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      <Monitor size={10} /> {modeFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ── Events Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile filters row */}
            <div className="flex gap-3 mb-5 md:hidden">
              <select
                value={clubFilter}
                onChange={e => setClubFilter(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              >
                {clubs.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
              <p className="text-gray-500 text-sm">
                Showing <span className="font-semibold text-gray-800">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''}
                {category !== 'All' && <span> in <strong>{category}</strong></span>}
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={16} className="text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="pl-2 pr-8 py-1.5 border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-400"
                  >
                    <option value="Newest">Newest First</option>
                    <option value="Event Date">Event Date</option>
                    <option value="Deadline Soon">Deadline Soon</option>
                    <option value="Most Popular">Most Popular</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setView('list')}
                    className={`p-1.5 rounded-md transition ${view === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setView('timeline')}
                    className={`p-1.5 rounded-md transition ${view === 'timeline' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Timeline View"
                  >
                    <Layout size={16} />
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed rounded-xl">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">No events found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any events matching your current filters. Try adjusting your search or clearing filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : view === 'timeline' ? (
              <Timeline events={filtered} userRole="student" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(event => (
                  <EventCard
                    key={event.id || event._id}
                    event={event}
                    onRegister={() => {}}
                    isRegistered={registrations.some(r => String(r.eventId?._id || r.eventId) === String(event.id || event._id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
