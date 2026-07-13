import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/analytics';

export const useAnalyticsStore = create((set, get) => ({
  studentAnalytics: null,
  clubHeadAnalytics: null,
  adminAnalytics: null,
  adminClubAnalytics: null,
  isLoading: false,
  error: null,

  fetchStudentAnalytics: async (userId, force = false) => {
    if (!userId || userId === 'undefined') return;
    if (!force && get().studentAnalytics) return; // Basic caching
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/student?userId=${userId}`);
      set({ studentAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch student analytics', isLoading: false });
    }
  },

  fetchClubHeadAnalytics: async (clubId, force = false) => {
    if (!clubId || clubId === 'undefined') return;
    if (!force && get().clubHeadAnalytics) return;
    console.log(`[analyticsStore] [${new Date().toISOString()}] set(isLoading: true). Action: fetchClubHeadAnalytics start`);
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/clubhead?clubId=${clubId}`);
      console.log(`[analyticsStore] [${new Date().toISOString()}] set(clubHeadAnalytics: response.data). Action: fetchClubHeadAnalytics success (Replacing)`);
      set({ clubHeadAnalytics: response.data, isLoading: false });
    } catch (error) {
      console.log(`[analyticsStore] [${new Date().toISOString()}] set(error). Action: fetchClubHeadAnalytics error`);
      set({ error: error.response?.data?.message || 'Failed to fetch club head analytics', isLoading: false });
    }
  },

  fetchAdminAnalytics: async (force = false) => {
    if (!force && get().adminAnalytics) return;
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/admin`);
      set({ adminAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch admin analytics', isLoading: false });
    }
  },

  fetchAdminClubAnalytics: async (clubId, force = false) => {
    if (!clubId || clubId === 'undefined') return;
    if (!force && get().adminClubAnalytics) return;
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/admin/club/${clubId}`);
      set({ adminClubAnalytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch admin club analytics', isLoading: false });
    }
  }
}));
