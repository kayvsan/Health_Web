import { create } from 'zustand';
import { monitorService } from '../services/api';

const useMonitorStore = create((set, get) => ({
  monitors: [],
  selectedMonitor: null,
  loading: false,
  error: null,

  fetchMonitors: async () => {
    set({ loading: true });
    try {
      const data = await monitorService.getAll();
      set({ monitors: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMonitorById: async (id) => {
    set({ loading: true });
    try {
      const data = await monitorService.getById(id);
      set({ selectedMonitor: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createMonitor: async (data) => {
    try {
      const newMonitor = await monitorService.create(data);
      set((state) => ({ monitors: [newMonitor, ...state.monitors] }));
      return newMonitor;
    } catch (error) {
      console.error('Failed to create monitor', error);
      throw error;
    }
  },

  updateMonitor: async (id, data) => {
    try {
      const updated = await monitorService.update(id, data);
      set((state) => ({
        monitors: state.monitors.map(m => m.id === id ? { ...m, ...updated } : m),
        selectedMonitor: state.selectedMonitor?.id === id ? { ...state.selectedMonitor, ...updated } : state.selectedMonitor
      }));
      return updated;
    } catch (error) {
      console.error('Failed to update monitor', error);
      throw error;
    }
  },

  deleteMonitor: async (id) => {
    try {
      await monitorService.delete(id);
      set((state) => ({
        monitors: state.monitors.filter(m => m.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete monitor', error);
      throw error;
    }
  },

  triggerCheck: async (id) => {
    try {
      await monitorService.checkNow(id);
      // The socket event will trigger the actual update in state
    } catch (error) {
      console.error('Manual check failed', error);
    }
  },

  toggleMonitor: async (id) => {
    try {
      const updated = await monitorService.toggle(id);
      set((state) => ({
        monitors: state.monitors.map(m => m.id === id ? { ...m, ...updated } : m)
      }));
    } catch (error) {
      console.error('Failed to toggle monitor', error);
    }
  },

  // Socket updates
  updateMonitorFromSocket: (data) => {
    set((state) => ({
      monitors: state.monitors.map(m => m.id === data.monitorId ? { 
        ...m, 
        status: data.status, 
        responseTime: data.responseTime, 
        lastCheckedAt: data.lastCheckedAt 
      } : m),
      selectedMonitor: state.selectedMonitor?.id === data.monitorId ? {
        ...state.selectedMonitor,
        status: data.status,
        responseTime: data.responseTime,
        lastCheckedAt: data.lastCheckedAt
      } : state.selectedMonitor
    }));
  },

  handleStatusChange: (data) => {
    // We could add toast notifications here or logic related specifically to status flips
    console.log(`Status changed for ${data.monitorId}: ${data.oldStatus} -> ${data.newStatus}`);
  }
}));

export default useMonitorStore;
