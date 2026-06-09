import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useEventStore } from '../store/eventStore'
import Navbar from '../components/Navbar'
import { Calendar, Clock, Users, Trophy, Search, Tag, X } from 'lucide-react'
import { format, isValid } from 'date-fns'

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
  const [tagFilter, setTagFilter] = useState('All')

  useEffect(() => {
    eventStore.fetchEvents?.()
  }, [])

  // Merge real events that have category === 'Hackathon' and are approved
  const eventHackathons = useMemo(() =>
    (events || [])
      .filter(e => e.category === 'Hackathon' && e.status === 'approved')
      .map(e => ({
        id:          `ev-${e.id}`, // Prefix to avoid key collisions
        realId:      e.id,
        title:       e.title,
        description: e.shortDescription || e.description,
        date:        e.startDate || e.date,
        deadline:    e.registrationDeadlineDate,
        deadlineTime: e.registrationDeadlineTime,
        teamSize:    e.maxTeamSize ? `Up to ${e.maxTeamSize}` : (e.participationType === 'Team' ? 'Team' : 'Individual'),
        tags:        e.tags || [],
        location:    e.location,
        mode:        e.mode,
        maxParticipants: e.maxParticipants,
        bannerImage: e.bannerImage,
        problemStatementPdf: e.problemStatementPdf,
        club:        e.club,
        source:      'event'
      })),
  [events])

  // Also include mock hackathons from hackathonStore
  const storeHackathons = (hackathons || []).map(h => ({
    id:          `st-${h.id}`, // Prefix to avoid key collisions
    realId:      h.id,
    title:       h.title,
    description: h.description,
    date:        h.date,
    deadline:    h.deadline,
    teamSize:    h.teamSize,
    tags:        h.domain ? [h.domain] : [],
    location:    h.college,
    prize:       h.prize,
    source:      'store'
  }))

  const all = [...eventHackathons, ...storeHackathons]



  const allTags = useMemo(() => {
    const tags = new Set()
    all.forEach(h => h.tags?.forEach(t => tags.add(t)))
    return ['All', ...tags]
  }, [all])

  const filtered = useMemo(() => all.filter(h => {
    const matchSearch = !search || h.title.toLowerCase().includes(search.toLowerCase()) ||
      (h.description || '').toLowerCase().includes(search.toLowerCase())
    const matchTag = tagFilter === 'All' || h.tags?.includes(tagFilter)
    return matchSearch && matchTag
  }), [all, search, tagFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={36} className="text-blue-200" />
            <h1 className="text-4xl font-extrabold tracking-tight">Hackathons</h1>
          </div>
          <p className="text-blue-100 text-lg mb-8 max-w-xl">
            Build, compete, and collaborate. Find the perfect hackathon for your skills.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hackathons…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-md"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tag filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                ${tagFilter === tag
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'}`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-5">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> hackathon{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Trophy size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No hackathons found</p>
            <p className="text-sm">Try a different search or tag</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(h => <HackathonCard key={h.id} hackathon={h} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function HackathonCard({ hackathon: h }) {
  const isDeadlineSoon = h.deadline && (new Date(h.deadline) - new Date()) < 3 * 24 * 60 * 60 * 1000

  return (
    <Link to={`/hackathons/${h.id}`} className="block group">
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
            {h.teamSize && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={14} className="text-primary-500 shrink-0" />
                <span>Team: {h.teamSize}</span>
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
            <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700">
              View Details →
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
