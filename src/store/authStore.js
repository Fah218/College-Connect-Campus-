import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      notifications: [],
      dashboardLayout: {},
      
      login: (userData) => {
        // Ensure _id exists to satisfy new strict ObjectId requirement
        if (userData && userData.id && !userData._id) {
          userData._id = userData.id;
        }
        return set({ user: userData, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false, notifications: [] }),
      
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
      
      addNotification: (notification) => set((state) => {
        // Deduplicate: if a notification with same id already exists, skip it
        const newId = notification.id || Date.now()
        if (state.notifications.some(n => n.id === newId)) return {}
        return {
          notifications: [
            { ...notification, id: newId, timestamp: new Date().toISOString(), read: false },
            ...state.notifications
          ]
        }
      }),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      updateDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      
      hasRole: (role) => {
        const state = useAuthStore.getState()
        return state.user?.role === role
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)
