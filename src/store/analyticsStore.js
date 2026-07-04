import { create } from 'zustand';
import api from '../services/api';

export const useAnalyticsStore = create((set) => ({
  studentAnalytics: null,
  clubHeadAnalytics: null,
  adminAnalytics: null,
  isLoading: false,
  error: null,

  fetchStudentAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/analytics/student');
      set({ studentAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch student analytics', isLoading: false });
    }
  },

  fetchClubHeadAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/analytics/clubhead');
      set({ clubHeadAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch club head analytics', isLoading: false });
    }
  },

  fetchAdminAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/analytics/admin');
      set({ adminAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch admin analytics', isLoading: false });
    }
  }
}));
