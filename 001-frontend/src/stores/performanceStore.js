import { create } from 'zustand';
import { performanceService } from '../services/api';

const usePerformanceStore = create((set) => ({
  overview: [],
  loading: false,

  fetchOverview: async () => {
    set({ loading: true });
    try {
      const data = await performanceService.getOverview();
      set({ overview: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch performance overview', error);
      set({ loading: false });
    }
  }
}));

export default usePerformanceStore;
