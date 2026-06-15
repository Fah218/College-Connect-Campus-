import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useRegistrationStore = create(
  persist(
    (set, get) => ({
      registrations: [],
      eventRegistrations: [], // for club heads looking at a specific event
      adminStats: {
        totalRegistrations: 0,
        individualRegs: 0,
        teamRegs: 0,
        totalParticipants: 0
      },
      isLoading: false,
      error: null,

      fetchStudentRegistrations: async (studentId) => {
        set({ isLoading: true, error: null })
        try {
          if (!studentId) return;

          const response = await axios.get(`http://localhost:5001/api/registrations/student/${studentId}`);
          
          // Combine individual and team registrations into one list for the student
          // Maps them so we have consistent access to the populated eventId
          const allRegs = [
            ...response.data.individual,
            ...response.data.team
          ];

          set({ registrations: allRegs, isLoading: false })
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          console.error('Fetch Student Registrations Error:', error)
        }
      },

      registerIndividual: async (eventId, formData, studentId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('http://localhost:5001/api/registrations', {
            eventId,
            participationType: 'Individual',
            studentId,
            formData
          });

          // Optimistically update
          set((state) => ({
            registrations: [...state.registrations, response.data.registration],
            isLoading: false
          }))
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          throw error;
        }
      },

      registerTeam: async (eventId, teamId, studentId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('http://localhost:5001/api/registrations', {
            eventId,
            participationType: 'Team',
            teamId,
            studentId
          });

          set((state) => ({
            registrations: [...state.registrations, response.data.registration],
            isLoading: false
          }))
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          throw error;
        }
      },

      fetchEventRegistrations: async (eventId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.get(`http://localhost:5001/api/registrations/event/${eventId}`);
          
          set({ eventRegistrations: response.data.registrations, isLoading: false })
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
        }
      },

      fetchAdminStats: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.get('http://localhost:5001/api/registrations/stats/admin');
          
          set({ adminStats: response.data, isLoading: false })
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
        }
      }
    }),
    {
      name: 'registration-store',
      partialize: (state) => ({ registrations: state.registrations }),
    }
  )
)
