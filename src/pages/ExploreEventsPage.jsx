import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import { Search, Filter, Calendar, MapPin, Tag, Layers, X } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Hackathon', 'Competition']

export default function ExploreEventsPage() {
  const { events, registeredEvents, registerForEvent } = useEventStore()
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('All')
  const [clubFilter, setClubFilter]   = useState('All')
  const [dateFilter, setDateFilter]   = useState('')

  // Show all events (including pending) so creators can see them immediately
  const approved = useMemo(() => events, [events])

  // Derive unique club list from approved events
  const clubs = useMemo(() => {
    const names = ['All', ...new Set(approved.map(e => e.club).filter(Boolean))]
    return names
  }, [approved])

  const filtered = useMemo(() => {
    return approved.filter(event => {
      const matchCat   = category === 'All' || event.category === category
      const matchClub  = clubFilter === 'All' || event.club === clubFilter
      const matchDate  = !dateFilter || (event.startDate || event.date || '').startsWith(dateFilter)
      const matchSearch = !search || event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.shortDescription || event.description || '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchClub && matchDate && matchSearch
    })
  }, [approved, category, clubFilter, dateFilter, search])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setClubFilter('All')
    setDateFilter('')
  }

  const hasActiveFilters = search || category !== 'All' || clubFilter !== 'All' || dateFilter

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

            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-500 text-sm">
                Showing <span className="font-semibold text-gray-800">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''}
                {category !== 'All' && <span> in <strong>{category}</strong></span>}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="md:hidden text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Search size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No events found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => {}}          // registration handled from inside EventCard
                    isRegistered={registeredEvents.includes(event.id)}
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
