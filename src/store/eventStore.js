import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useEventStore = create(
  persist(
    (set, get) => ({
      events: [],
      auditLogs: [],
      
      fetchEvents: async () => {
        try {
          const response = await axios.get('http://localhost:5001/api/events');
          const dbEvents = response.data.events.map(dbEvent => ({
            ...dbEvent,
            id: dbEvent._id,
            attendees: dbEvent.attendees || 0,
            club: dbEvent.clubName, // map clubName back to club for backward compatibility with frontend
            capacity: dbEvent.maxParticipants || 100, // Map maxParticipants to capacity for the UI
            date: dbEvent.date || dbEvent.startDate,
            time: dbEvent.time || dbEvent.startTime
          }));
          set({ events: dbEvents });
        } catch (error) {
          console.error("Error fetching events from DB:", error);
        }
      },
      
      addEvent: async (event) => {
        const payload = {
          ...event,
          clubName: event.club || 'Tech Club',
          date: event.date || event.startDate || new Date().toISOString().split('T')[0],
          time: event.time || event.startTime || '12:00',
          shortDescription: event.shortDescription || 'No description provided',
          description: event.description || 'No description provided',
          registrationDeadlineDate: event.registrationDeadlineDate || new Date().toISOString().split('T')[0],
          registrationDeadlineTime: event.registrationDeadlineTime || '23:59',
          location: event.location || 'TBA',
          category: event.category || 'Workshop',
          status: 'pending'
        };

        try {
          const response = await axios.post('http://localhost:5001/api/events/create', payload);
          const dbEvent = response.data.event;
          
          const newEvent = { 
            ...dbEvent, 
            id: dbEvent._id,
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
        } catch (error) {
          console.error("Error saving event to database:", error);
          throw error;
        }
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
      
      // Legacy registerForEvent removed; useRegistrationStore handles this now.
      
      approveEvent: async (id, approver) => {
        try {
          // If the event has a MongoDB ObjectId (string), save to backend
          if (typeof id === 'string') {
            await axios.put(`http://localhost:5001/api/events/${id}`, { status: 'approved' });
          }
          set((state) => ({
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
          }));
        } catch (error) {
          console.error("Error approving event:", error);
        }
      },
      
      rejectEvent: async (id, comment, rejector) => {
        try {
          if (typeof id === 'string') {
            await axios.put(`http://localhost:5001/api/events/${id}`, { 
              status: 'rejected',
              rejectionComment: comment
            });
          }
          set((state) => ({
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
          }));
        } catch (error) {
          console.error("Error rejecting event:", error);
        }
      },
      
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
