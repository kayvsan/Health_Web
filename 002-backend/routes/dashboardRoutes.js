import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const allMonitors = await prisma.monitor.findMany({
      include: {
        logs: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const upCount = allMonitors.filter(m => m.status === 'up').length;
    const downCount = allMonitors.filter(m => m.status === 'down').length;
    const degradedCount = allMonitors.filter(m => m.status === 'degraded').length;
    
    // Average response time
    const upMonitors = allMonitors.filter(m => m.status !== 'down');
    let totalResp = 0;
    upMonitors.forEach(m => {
        if(m.logs && m.logs[0]) totalResp += m.logs[0].responseTime;
    });
    const avgResponse = upMonitors.length > 0 ? Math.round(totalResp / upMonitors.length) : 0;

    const overallUptime = allMonitors.length > 0 
      ? Number((allMonitors.reduce((sum, m) => sum + m.uptime, 0) / allMonitors.length).toFixed(2))
      : 100.0;

    const activeIncidentsCount = await prisma.incident.count({
      where: { status: 'active' }
    });

    res.json({
      totalMonitors: allMonitors.length,
      upCount,
      downCount,
      degradedCount,
      overallUptime,
      avgResponseTime: avgResponse,
      activeIncidents: activeIncidentsCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// GET /api/dashboard/response-chart
router.get('/dashboard/response-chart', async (req, res) => {
  try {
    const { range, startDate: queryStartDate, endDate: queryEndDate, monitorId } = req.query;
    
    let startDate, endDate, diffMs;
    
    if (queryStartDate && queryEndDate) {
      startDate = new Date(queryStartDate);
      endDate = new Date(queryEndDate);
      endDate.setHours(23, 59, 59, 999);
      diffMs = endDate.getTime() - startDate.getTime();
    } else {
      const parsedRange = range || '24h';
      let timeAgo = 24 * 60 * 60 * 1000;
      if (parsedRange === '7d') timeAgo = 7 * 24 * 60 * 60 * 1000;
      if (parsedRange === '30d') timeAgo = 30 * 24 * 60 * 60 * 1000;
      diffMs = timeAgo;
      startDate = new Date(Date.now() - timeAgo);
      endDate = new Date();
    }
    
    const where = { createdAt: { gte: startDate, lte: endDate } };
    if (monitorId && monitorId !== 'all') {
      where.monitorId = monitorId;
    }

    const logs = await prisma.monitorLog.findMany({
      where,
      include: { monitor: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    });

    const groupedData = {};

    logs.forEach(log => {
      const date = new Date(log.createdAt);
      let timeKey = '';
      
      const daysDiff = diffMs / (24 * 60 * 60 * 1000);

      if (daysDiff <= 1) {
        // 10-minute intervals for <= 24h
        const hours = date.getHours().toString().padStart(2, '0');
        const tensOfMins = Math.floor(date.getMinutes() / 10) * 10;
        timeKey = `${hours}:${tensOfMins.toString().padStart(2, '0')}`;
      } else if (daysDiff <= 7) {
        // Hourly for <= 7d
        const options = { month: 'short', day: 'numeric' };
        const dayStr = date.toLocaleDateString('en-US', options);
        const hours = date.getHours().toString().padStart(2, '0');
        timeKey = `${dayStr} ${hours}:00`;
      } else {
        // Daily for > 7d
        const options = { month: 'short', day: 'numeric' };
        timeKey = date.toLocaleDateString('en-US', options);
      }
      
      if (!groupedData[timeKey]) {
        groupedData[timeKey] = { time: timeKey };
      }
      
      const monitorName = log.monitor.name;
      if (!groupedData[timeKey][monitorName]) {
        groupedData[timeKey][monitorName] = [];
      }
      groupedData[timeKey][monitorName].push(log.responseTime || 0);
    });

    // Average the response times per monitor per time slot, and calculate max for >24h
    const chartData = Object.values(groupedData).map(slot => {
      const formattedSlot = { time: slot.time };
      Object.keys(slot).forEach(key => {
        if (key !== 'time') {
          const times = slot[key];
          const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
          const max = Math.max(...times);
          
          formattedSlot[key] = avg;
          // Include max for > 24h
          const daysDiff = diffMs / (24 * 60 * 60 * 1000);
          if (daysDiff > 1) {
            formattedSlot[`${key}_max`] = max;
          }
        }
      });
      return formattedSlot;
    });

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// GET /api/incidents
router.get('/incidents', async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const incidents = await prisma.incident.findMany({
      where: { status },
      include: { monitor: true },
      orderBy: { startedAt: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/performance/overview
router.get('/performance/overview', async (req, res) => {
  try {
    // In a real scenario we'd do a group by. For now, fetch monitors and their recent logs.
    const monitors = await prisma.monitor.findMany({
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    const overview = monitors.map(m => {
      const respTimes = m.logs.map(l => l.responseTime).sort((a,b) => a - b);
      let avg = 0, p50 = 0, p95 = 0;
      
      if (respTimes.length > 0) {
        avg = Math.round(respTimes.reduce((a,b)=>a+b, 0) / respTimes.length);
        p50 = respTimes[Math.floor(respTimes.length * 0.5)];
        p95 = respTimes[Math.floor(respTimes.length * 0.95)];
      }

      const currentStatusCode = m.logs.length > 0 ? m.logs[0].statusCode : null;

      return {
        id: m.id,
        name: m.name,
        status: m.status,
        uptime: m.uptime,
        avg,
        p50,
        p95,
        statusCode: currentStatusCode
      };
    });

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance overview' });
  }
});

// GET /api/performance/trends
router.get('/performance/trends', async (req, res) => {
  res.json([]);
});

// GET /api/dashboard/status-distribution
router.get('/dashboard/status-distribution', async (req, res) => {
  try {
    const { monitorId, startDate: queryStartDate, endDate: queryEndDate } = req.query;
    
    let startDate, endDate;
    
    if (queryStartDate && queryEndDate) {
      startDate = new Date(queryStartDate);
      endDate = new Date(queryEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default fetch last 30 days
      const timeAgo = 30 * 24 * 60 * 60 * 1000;
      startDate = new Date(Date.now() - timeAgo);
      endDate = new Date();
    }

    const where = { createdAt: { gte: startDate, lte: endDate } };
    if (monitorId && monitorId !== 'all') {
      where.monitorId = monitorId;
    }

    const logs = await prisma.monitorLog.findMany({
      where,
      select: { createdAt: true, statusCode: true },
      orderBy: { createdAt: 'asc' }
    });

    const groupedData = {};

    logs.forEach(log => {
      // Group by day "DD MMM"
      const date = new Date(log.createdAt);
      const options = { month: 'short', day: 'numeric' };
      const timeKey = date.toLocaleDateString('en-US', options);
      
      if (!groupedData[timeKey]) {
        groupedData[timeKey] = { time: timeKey };
      }
      
      const code = log.statusCode || 0;
      const category = code === 0 ? 'Timeout_Error' : String(code);

      if (!groupedData[timeKey][category]) {
        groupedData[timeKey][category] = 0;
      }
      groupedData[timeKey][category] += 1;
    });

    // Return counts directly
    const chartData = Object.values(groupedData).map(slot => {
      return slot;
    });

    res.json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch status distribution' });
  }
});

// GET /api/dashboard/health-distribution
router.get('/dashboard/health-distribution', async (req, res) => {
  try {
    const { monitorId, startDate: queryStartDate, endDate: queryEndDate } = req.query;
    
    let startDate, endDate;
    
    if (queryStartDate && queryEndDate) {
      startDate = new Date(queryStartDate);
      endDate = new Date(queryEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const timeAgo = 30 * 24 * 60 * 60 * 1000;
      startDate = new Date(Date.now() - timeAgo);
      endDate = new Date();
    }

    const where = { createdAt: { gte: startDate, lte: endDate } };
    if (monitorId && monitorId !== 'all') {
      where.monitorId = monitorId;
    }

    const logs = await prisma.monitorLog.findMany({
      where,
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' }
    });

    const groupedData = {};

    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const options = { month: 'short', day: 'numeric' };
      const timeKey = date.toLocaleDateString('en-US', options);
      
      if (!groupedData[timeKey]) {
        groupedData[timeKey] = { time: timeKey };
      }
      
      const statusCategory = log.status || 'unknown';

      if (!groupedData[timeKey][statusCategory]) {
        groupedData[timeKey][statusCategory] = 0;
      }
      groupedData[timeKey][statusCategory] += 1;
    });

    const chartData = Object.values(groupedData).map(slot => {
      return slot;
    });

    res.json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch health distribution' });
  }
});

export default router;
