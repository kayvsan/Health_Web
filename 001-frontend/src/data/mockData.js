import { subMinutes, subHours, subDays, format } from 'date-fns';

const now = new Date();

export const monitors = [
  {
    id: 'm1',
    name: 'Realdata Indonesia',
    url: 'https://realdataid.com',
    status: 'up', // 'up', 'down', 'degraded'
    uptime: 99.99,
    responseTime: 145,
    interval: 60,
    checkContent: true,
    lastChecked: subMinutes(now, 1).toISOString(),
  },
  {
    id: 'm2',
    name: 'Indonesian Junior Golf',
    url: 'https://ijg.or.id',
    status: 'up',
    uptime: 99.95,
    responseTime: 210,
    interval: 300,
    checkContent: false,
    lastChecked: subMinutes(now, 2).toISOString(),
  },
  {
    id: 'm3',
    name: 'Health Insurance Portal',
    url: 'http://eacaac.com',
    status: 'down',
    uptime: 98.45,
    responseTime: 0,
    interval: 60,
    checkContent: true,
    lastChecked: subMinutes(now, 1).toISOString(),
  },
  {
    id: 'm4',
    name: 'API Gateway',
    url: 'https://api.realdataid.com/health',
    status: 'degraded',
    uptime: 99.10,
    responseTime: 850,
    interval: 30,
    checkContent: false,
    lastChecked: subMinutes(now, 0).toISOString(),
  }
];

export const incidents = [
  {
    id: 'inc_1',
    monitorId: 'm3',
    monitorName: 'Health Insurance Portal',
    type: 'downtime',
    severity: 'critical',
    message: 'Connection Timeout. Server did not respond within 10000ms.',
    status: 'active',
    startedAt: subMinutes(now, 45).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'inc_2',
    monitorId: 'm4',
    monitorName: 'API Gateway',
    type: 'slow_response',
    severity: 'warning',
    message: 'Response time spiked to 850ms (threshold: 500ms).',
    status: 'active',
    startedAt: subMinutes(now, 15).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'inc_3',
    monitorId: 'm1',
    monitorName: 'Realdata Indonesia',
    type: 'content_change',
    severity: 'info',
    message: 'Homepage content changed. Diff hash updated.',
    status: 'resolved',
    startedAt: subHours(now, 2).toISOString(),
    resolvedAt: subHours(now, 1.9).toISOString(),
  }
];

// Generate 24 hours of uptime data for charts
export const uptimeHistory = Array.from({ length: 24 }).map((_, i) => ({
  time: format(subHours(now, 23 - i), 'HH:00'),
  'Realdata Indonesia': 140 + Math.random() * 20,
  'Indonesian Junior Golf': 200 + Math.random() * 30,
  'Health Insurance Portal': (23 - i) > 1 ? (180 + Math.random() * 40) : 0, // Down in last hour
  'API Gateway': 120 + ((23 - i) > 20 ? 600 : Math.random() * 50), // Spiked recently
}));

export const contentChanges = [
  {
    id: 'cc_1',
    monitorId: 'm1',
    monitorName: 'Realdata Indonesia',
    timestamp: subHours(now, 2).toISOString(),
    diffSummary: 'Added new section: "Promo Akhir Tahun". Modified 3 links in footer.',
  },
  {
    id: 'cc_2',
    monitorId: 'm3',
    monitorName: 'Health Insurance Portal',
    timestamp: subDays(now, 1).toISOString(),
    diffSummary: 'Title changed from "Portal Asuransi" to "Portal Asuransi Kesehatan Resmi".',
  }
];

export const dashboardSummary = {
  totalMonitors: monitors.length,
  upMonitors: monitors.filter(m => m.status === 'up').length,
  downMonitors: monitors.filter(m => m.status === 'down').length,
  degradedMonitors: monitors.filter(m => m.status === 'degraded').length,
  overallUptime: 99.37,
  avgResponseTime: Math.round(monitors.reduce((acc, curr) => acc + curr.responseTime, 0) / monitors.filter(m => m.status !== 'down').length),
  activeIncidents: incidents.filter(i => i.status === 'active').length
};
