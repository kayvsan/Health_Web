import { io } from 'socket.io-client';
import useMonitorStore from '../stores/monitorStore';
import useDashboardStore from '../stores/dashboardStore';

let socket;

export const initSocketListeners = () => {
  if (socket) return;
  
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  socket = io(socketUrl);

  socket.on('connect', () => {
    console.log('🔌 Connected to server via Socket.io');
  });

  socket.on('monitor:update', (data) => {
    useMonitorStore.getState().updateMonitorFromSocket(data);
  });

  socket.on('monitor:status-change', (data) => {
    useMonitorStore.getState().handleStatusChange(data);
  });

  socket.on('incident:new', (data) => {
    useDashboardStore.getState().addIncidentFromSocket(data.incident);
  });

  socket.on('incident:resolved', (data) => {
    useDashboardStore.getState().resolveIncidentFromSocket(data.incidentId);
  });

  socket.on('dashboard:summary', (data) => {
    useDashboardStore.getState().updateSummaryFromSocket(data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
