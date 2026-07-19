import { create } from 'zustand';
import axios from 'axios';

export const useClubStore = create((set, get) => ({
  clubs: [],
  loading: false,
  error: null,

  fetchClubs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('http://localhost:5001/api/clubs');
      set({ clubs: response.data.clubs, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  toggleArchiveStatus: async (clubId, isArchived) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/clubs/${clubId}/archive`, { isArchived });
      set(state => ({
        clubs: state.clubs.map(c => c._id === clubId ? { ...c, isArchived } : c)
      }));
      return response.data.club;
    } catch (error) {
      console.error('Error toggling club archive status', error);
      throw error;
    }
  },

  reassignHead: async (clubId, headName, email) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/clubs/${clubId}/reassign`, { headName, email });
      set(state => ({
        clubs: state.clubs.map(c => c._id === clubId ? { ...c, name: headName, email: email } : c)
      }));
      return response.data.club;
    } catch (error) {
      console.error('Error reassigning club head', error);
      throw error;
    }
  }
}));
