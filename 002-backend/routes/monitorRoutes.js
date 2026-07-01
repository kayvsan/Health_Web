import express from 'express';
import { prisma } from '../index.js';
import { checkMonitor } from '../services/monitorChecker.js';

const router = express.Router();

// GET /api/monitors
router.get('/', async (req, res) => {
  try {
    const monitors = await prisma.monitor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(monitors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// GET /api/monitors/:id
router.get('/:id', async (req, res) => {
  try {
    const monitor = await prisma.monitor.findUnique({
      where: { id: req.params.id },
      include: {
        logs: { orderBy: { createdAt: 'desc' }, take: 10 },
        incidents: { where: { status: 'active' } }
      }
    });
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    res.json(monitor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monitor details' });
  }
});

// POST /api/monitors
router.post('/', async (req, res) => {
  try {
    const { name, url, interval } = req.body;
    const monitor = await prisma.monitor.create({
      data: { name, url, interval: Number(interval) || 60 }
    });
    res.status(201).json(monitor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// PUT /api/monitors/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, url, interval } = req.body;
    const monitor = await prisma.monitor.update({
      where: { id: req.params.id },
      data: { name, url, interval: Number(interval) }
    });
    res.json(monitor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

// DELETE /api/monitors/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.monitor.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

// POST /api/monitors/:id/check
router.post('/:id/check', async (req, res) => {
  try {
    const result = await checkMonitor(req.params.id);
    if (!result) return res.status(404).json({ error: 'Monitor not found or inactive' });
    res.json(result.log);
  } catch (error) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// PATCH /api/monitors/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const monitor = await prisma.monitor.findUnique({ where: { id: req.params.id } });
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    
    const updated = await prisma.monitor.update({
      where: { id: req.params.id },
      data: { isActive: !monitor.isActive }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle monitor' });
  }
});

export default router;
