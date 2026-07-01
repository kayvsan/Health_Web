import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const monitorService = {
  getAll: () => api.get('/monitors').then(res => res.data),
  getById: (id) => api.get(`/monitors/${id}`).then(res => res.data),
  create: (data) => api.post('/monitors', data).then(res => res.data),
  update: (id, data) => api.put(`/monitors/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/monitors/${id}`).then(res => res.data),
  checkNow: (id) => api.post(`/monitors/${id}/check`).then(res => res.data),
  toggle: (id) => api.patch(`/monitors/${id}/toggle`).then(res => res.data),
};

export const logService = {
  getByMonitor: (id, limit = 50) => api.get(`/monitors/${id}/logs?limit=${limit}`).then(res => res.data),
  getUptime: (id) => api.get(`/monitors/${id}/uptime`).then(res => res.data),
  getResponseTime: (id) => api.get(`/monitors/${id}/response-time`).then(res => res.data),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary').then(res => res.data),
  getResponseChart: (range = '24h', monitorId, startDate, endDate) => {
    let url = `/dashboard/response-chart?range=${range}`;
    if (monitorId && monitorId !== 'all') url += `&monitorId=${monitorId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return api.get(url).then(res => res.data);
  },
  getIncidents: (status = 'active') => api.get(`/incidents?status=${status}`).then(res => res.data),
  getStatusDistribution: (monitorId = 'all', startDate, endDate) => {
    let url = `/dashboard/status-distribution?monitorId=${monitorId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return api.get(url).then(res => res.data);
  },
  getHealthDistribution: (monitorId = 'all', startDate, endDate) => {
    let url = `/dashboard/health-distribution?monitorId=${monitorId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return api.get(url).then(res => res.data);
  },
};

export const performanceService = {
  getOverview: () => api.get('/performance/overview').then(res => res.data),
  getTrends: () => api.get('/performance/trends').then(res => res.data),
};

export const telegramService = {
  getConfigs: () => api.get('/settings/telegram').then(res => res.data),
  addConfig: (data) => api.post('/settings/telegram', data).then(res => res.data),
  updateConfig: (id, data) => api.put(`/settings/telegram/${id}`, data).then(res => res.data),
  deleteConfig: (id) => api.delete(`/settings/telegram/${id}`).then(res => res.data),
  testConnection: (data) => api.post('/settings/telegram/test', data).then(res => res.data),
};

export default api;
