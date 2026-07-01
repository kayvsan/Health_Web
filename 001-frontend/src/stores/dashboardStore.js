import { create } from 'zustand';
import { dashboardService } from '../services/api';

const useDashboardStore = create((set) => ({
  summary: {
    totalMonitors: 0,
    upCount: 0,
    downCount: 0,
    degradedCount: 0,
    overallUptime: 100,
    avgResponseTime: 0,
    activeIncidents: 0
  },
  incidents: [],
  chartData: [],
  loading: false,

  fetchSummary: async () => {
    try {
      const data = await dashboardService.getSummary();
      set({ summary: data });
    } catch (error) {
      console.error('Failed to fetch summary', error);
    }
  },

  fetchIncidents: async () => {
    try {
      const data = await dashboardService.getIncidents('active');
      set({ incidents: data });
    } catch (error) {
      console.error('Failed to fetch incidents', error);
    }
  },

  fetchChartData: async (range = '24h') => {
    try {
      const data = await dashboardService.getResponseChart(range);
      set({ chartData: data });
    } catch (error) {
      console.error('Failed to fetch chart data', error);
    }
  },

  // Socket events
  updateSummaryFromSocket: (data) => {
    set({ summary: data });
  },

  addIncidentFromSocket: (incident) => {
    set((state) => ({ incidents: [incident, ...state.incidents] }));
  },

  resolveIncidentFromSocket: (incidentId) => {
    set((state) => ({
      incidents: state.incidents.filter(i => i.id !== incidentId)
    }));
  }
}));

export default useDashboardStore;
