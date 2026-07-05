import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useEventStore = create(
  persist(
    (set, get) => ({
      events: [],
      auditLogs: [],
      isLoading: false,
  uploadProgress: 0,
      error: null,
      lastFetched: null,
      
      fetchEvents: async (force = false) => {
        const { lastFetched, isLoading } = get();
        // Cache mechanism: don't fetch if less than 60 seconds ago unless forced
        if (!force && lastFetched && Date.now() - lastFetched < 60000) {
          return;
        }
        if (isLoading && !force) return;
        
        console.log("fetchEvents called. Current events count:", get().events.length); set({ isLoading: true, error: null });
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
          console.log("fetchEvents success. Fetched count:", dbEvents.length); set({ events: dbEvents, isLoading: false, lastFetched: Date.now() });
        } catch (error) {
          console.error("Error fetching events from DB:", error);
          set({ isLoading: false, error: error.message });
        }
      },
      
      addEvent: async (event) => {
        const payload = {
          ...event,
          clubName: event.club || '',
          startDate: event.startDate || event.date || new Date().toISOString().split('T')[0],
          startTime: event.startTime || event.time || '12:00',
          shortDescription: event.shortDescription || 'No description provided',
          description: event.description || 'No description provided',
          registrationDeadlineDate: event.registrationDeadlineDate || new Date().toISOString().split('T')[0],
          registrationDeadlineTime: event.registrationDeadlineTime || '23:59',
          location: event.location || 'TBA',
          category: event.category || 'Workshop',
          status: 'pending'
        };

        try {
          const fd = new FormData();
          fd.append('eventData', JSON.stringify(payload));
          if (event.bannerImageFile) fd.append('bannerImage', event.bannerImageFile);
          if (event.additionalImageFile) fd.append('additionalImages', event.additionalImageFile);
          if (event.additionalImageFiles) {
            event.additionalImageFiles.forEach(file => fd.append('additionalImages', file));
          }
          if (event.problemStatementPdfFile) {
            fd.append('problemStatementPdf', event.problemStatementPdfFile);
          }
          
          const response = await axios.post('http://localhost:5001/api/events/create', fd, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              set({ uploadProgress: percentCompleted });
            }
          });
          set({ uploadProgress: 0 });
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
      
      updateEvent: async (id, updates) => {
        try {
          // Optimistic UI update immediately
          set((state) => {
            const existing = state.events.find(e => String(e.id || e._id) === String(id));
            if (!existing) return state;
            
            // Clean up files so they don't break the UI
            const optimisticEvent = { ...existing, ...updates, status: 'pending' };
            delete optimisticEvent.bannerImageFile;
            delete optimisticEvent.additionalImageFile;
            delete optimisticEvent.additionalImageFiles;

            return {
              events: state.events.map(e => String(e.id || e._id) === String(id) ? optimisticEvent : e)
            };
          });

          // If the event has a MongoDB ObjectId (string), save to backend
if (typeof id === 'string') {
            const fd = new FormData();
            
            // Extract file objects
            const bannerFile = updates.bannerImageFile;
            const additionalFiles = updates.additionalImageFile;
            const additionalImageFilesArr = updates.additionalImageFiles; // note this is often an array or a single file
            const pdfFile = updates.problemStatementPdfFile;
            
            // Remove file objects from updates to avoid circular JSON
            const cleanUpdates = { ...updates, status: 'pending' };
            delete cleanUpdates.bannerImageFile;
            delete cleanUpdates.additionalImageFile;
            delete cleanUpdates.additionalImageFiles;
            delete cleanUpdates.problemStatementPdfFile;
            
            fd.append('eventData', JSON.stringify(cleanUpdates));
            
            if (bannerFile) fd.append('bannerImage', bannerFile);
            if (pdfFile) fd.append('problemStatementPdf', pdfFile);
            if (additionalFiles && additionalFiles.length) {
              for(let i=0; i<additionalFiles.length; i++) {
                fd.append('additionalImages', additionalFiles[i]);
              }
            } else if (additionalFiles) {
              fd.append('additionalImages', additionalFiles);
            }
            if (additionalImageFilesArr) {
              for(let i=0; i<additionalImageFilesArr.length; i++) {
                fd.append('additionalImages', additionalImageFilesArr[i]);
              }
            }

            const response = await axios.put(`http://localhost:5001/api/events/${id}`, fd, {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                set({ uploadProgress: percentCompleted });
              }
            });
            set({ uploadProgress: 0 });
            
            set((state) => ({
              events: state.events.map(e => String(e.id || e._id) === String(id) ? { ...e, ...response.data.event, status: 'pending' } : e),
              auditLogs: [...state.auditLogs, {
                id: Date.now(),
                action: 'updated',
                eventId: id,
                eventTitle: state.events.find(ev => String(ev.id || ev._id) === String(id))?.title,
                timestamp: new Date().toISOString(),
                user: 'Club Head'
              }]
            }));
          } else {
            // Local fallback
            set((state) => ({
              events: state.events.map(e => e.id === id ? { ...e, ...updates, status: 'pending' } : e),
            auditLogs: [...state.auditLogs, {
              id: Date.now(),
              action: 'updated',
              eventId: id,
              eventTitle: state.events.find(e => e.id === id)?.title,
              timestamp: new Date().toISOString(),
              user: 'Club Head'
            }]
          }));
          }
        } catch (error) {
          console.error("Error updating event:", error);
          throw error;
        }
      },
      
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
      name: 'event-storage',
      partialize: (state) => ({ auditLogs: state.auditLogs }),
    }
  )
)
