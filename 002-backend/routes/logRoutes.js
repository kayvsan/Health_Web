import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/monitors/:id/logs
router.get('/monitors/:id/logs', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = await prisma.monitorLog.findMany({
      where: { monitorId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/monitors/:id/uptime
router.get('/monitors/:id/uptime', async (req, res) => {
  try {
    // Basic uptime calculated by check count over a period.
    // For simplicity right now we'll just return the pre-calculated one on the monitor.
    const monitor = await prisma.monitor.findUnique({
      where: { id: req.params.id },
      select: { uptime: true }
    });
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    res.json({ uptime: monitor.uptime });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch uptime' });
  }
});

// GET /api/monitors/:id/response-time
router.get('/monitors/:id/response-time', async (req, res) => {
  try {
    const logs = await prisma.monitorLog.findMany({
      where: { monitorId: req.params.id },
      orderBy: { createdAt: 'asc' }, // older to newer for charts
      take: 100 // limit to last 100 checks for now
    });
    
    const chartData = logs.map(l => ({
      time: l.createdAt,
      responseTime: l.responseTime
    }));
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch response time data' });
  }
});

export default router;
