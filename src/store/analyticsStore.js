import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/analytics';

export const useAnalyticsStore = create((set) => ({
  studentAnalytics: null,
  clubHeadAnalytics: null,
  adminAnalytics: null,
  isLoading: false,
  error: null,

  fetchStudentAnalytics: async (userId) => {
    if (!userId || userId === 'undefined') return;
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/student?userId=${userId}`);
      set({ studentAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch student analytics', isLoading: false });
    }
  },

  fetchClubHeadAnalytics: async (clubId) => {
    if (!clubId || clubId === 'undefined') return;
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/clubhead?clubId=${clubId}`);
      set({ clubHeadAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch club head analytics', isLoading: false });
    }
  },

  fetchAdminAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/admin`);
      set({ adminAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch admin analytics', isLoading: false });
    }
  }
}));
