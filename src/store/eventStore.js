import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useEventStore = create(
  persist(
    (set, get) => ({
      events: [
        {
          id: 1,
          title: 'Tech Talk: AI in Education',
          club: 'Tech Club',
          category: 'Workshop',
          date: '2025-01-15',
          time: '14:00',
          location: 'Auditorium A',
          description: 'Learn about AI applications in modern education',
          tags: ['AI', 'Technology', 'Education'],
          status: 'approved',
          attendees: 45,
          capacity: 100,
          domains: ['AI', 'Education'],
          collaboratingClubs: []
        },
        {
          id: 2,
          title: 'Annual Hackathon 2025',
          club: 'Coding Club',
          category: 'Hackathon',
          date: '2025-01-20',
          time: '09:00',
          location: 'Computer Lab',
          description: '24-hour coding marathon',
          tags: ['Hackathon', 'Coding', 'Competition'],
          status: 'approved',
          attendees: 80,
          capacity: 120,
          domains: ['Web Development', 'Programming'],
          collaboratingClubs: ['Tech Club']
        },
        {
          id: 3,
          title: 'Web Development Bootcamp',
          club: 'Tech Club',
          category: 'Workshop',
          date: '2025-01-25',
          time: '10:00',
          location: 'Lab 3',
          description: 'Intensive web development training',
          tags: ['Web', 'Frontend', 'Backend'],
          status: 'approved',
          attendees: 60,
          capacity: 80,
          domains: ['Web Development'],
          collaboratingClubs: []
        }
      ],
      
      registeredEvents: [],
      auditLogs: [],
      
      addEvent: (event) => {
        const newEvent = { 
          ...event, 
          id: Date.now(), 
          status: 'pending',
          createdAt: new Date().toISOString(),
          attendees: 0
        }
        set((state) => ({
          events: [...state.events, newEvent],
          auditLogs: [...state.auditLogs, {
            id: Date.now(),
            action: 'created',
            eventId: newEvent.id,
            eventTitle: newEvent.title,
            timestamp: new Date().toISOString(),
            user: 'Club Head'
          }]
        }))
        return newEvent
      },
      
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, ...updates } : e),
        auditLogs: [...state.auditLogs, {
          id: Date.now(),
          action: 'updated',
          eventId: id,
          eventTitle: state.events.find(e => e.id === id)?.title,
          timestamp: new Date().toISOString(),
          user: 'Club Head'
        }]
      })),
      
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id),
        auditLogs: [...state.auditLogs, {
          id: Date.now(),
          action: 'deleted',
          eventId: id,
          eventTitle: state.events.find(e => e.id === id)?.title,
          timestamp: new Date().toISOString(),
          user: 'Club Head'
        }]
      })),
      
      registerForEvent: (eventId, userId) => {
        const state = get()
        const event = state.events.find(e => e.id === eventId)
        
        // Check for duplicate registration
        if (state.registeredEvents.includes(eventId)) {
          throw new Error('You are already registered for this event')
        }
        
        // Check capacity
        if (event && event.attendees >= event.capacity) {
          throw new Error('Event is at full capacity')
        }
        
        set((state) => ({
          registeredEvents: [...state.registeredEvents, eventId],
          events: state.events.map(e => 
            e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
          )
        }))
      },
      
      approveEvent: (id, approver) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, status: 'approved' } : e),
        auditLogs: [...state.auditLogs, {
          id: Date.now(),
          action: 'approved',
          eventId: id,
          eventTitle: state.events.find(e => e.id === id)?.title,
          timestamp: new Date().toISOString(),
          user: approver || 'Admin',
          remarks: 'Event approved'
        }]
      })),
      
      rejectEvent: (id, comment, rejector) => set((state) => ({
        events: state.events.map(e => e.id === id ? { 
          ...e, 
          status: 'rejected', 
          rejectionComment: comment 
        } : e),
        auditLogs: [...state.auditLogs, {
          id: Date.now(),
          action: 'rejected',
          eventId: id,
          eventTitle: state.events.find(e => e.id === id)?.title,
          timestamp: new Date().toISOString(),
          user: rejector || 'Admin',
          remarks: comment
        }]
      })),
      
      getAuditLogs: () => get().auditLogs,
      
      getEventSummary: (event) => {
        const domains = event.domains?.join(', ') || 'general'
        const level = event.tags?.includes('Beginner') ? 'beginners' : 'all skill levels'
        return `This event focuses on ${domains} and is suitable for ${level}.`
      }
    }),
    {
      name: 'event-storage'
    }
  )
)
