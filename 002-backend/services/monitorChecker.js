import { prisma } from '../index.js';
import { probeUrl, determineStatus } from './probeService.js';
import { evaluateAndManageIncident } from './incidentService.js';

let ioInstance = null;
export const setSocketIo = (io) => { ioInstance = io; };

export const calculateUptime = async (monitorId) => {
  const totalLogs = await prisma.monitorLog.count({ where: { monitorId } });
  if (totalLogs === 0) return 100.0;
  
  const upLogs = await prisma.monitorLog.count({ 
    where: { 
      monitorId, 
      status: { in: ['up', 'degraded'] } 
    } 
  });
  
  return Number(((upLogs / totalLogs) * 100).toFixed(4));
};

export const checkMonitor = async (monitorId) => {
  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
  if (!monitor || !monitor.isActive) return null;

  const probeResult = await probeUrl(monitor.url);
  const finalStatus = determineStatus(probeResult, 500); // 500ms degraded threshold

  // Create Log
  const log = await prisma.monitorLog.create({
    data: {
      monitorId: monitor.id,
      status: finalStatus,
      responseTime: probeResult.responseTime,
      dnsTime: probeResult.dnsTime,
      tcpTime: probeResult.tcpTime,
      tlsTime: probeResult.tlsTime,
      ttfb: probeResult.ttfb,
      statusCode: probeResult.statusCode,
      errorMessage: probeResult.errorMessage
    }
  });

  const uptime = await calculateUptime(monitor.id);

  // Manage Incidents
  const { incident, isNew, isResolved } = await evaluateAndManageIncident(monitor, probeResult, finalStatus);

  // Update Monitor
  const updatedMonitor = await prisma.monitor.update({
    where: { id: monitor.id },
    data: {
      status: finalStatus,
      uptime: uptime,
      lastCheckedAt: new Date()
    }
  });

  // Emit events if socket is ready
  if (ioInstance) {
    ioInstance.emit('monitor:update', {
      monitorId: updatedMonitor.id,
      status: updatedMonitor.status,
      responseTime: probeResult.responseTime,
      statusCode: probeResult.statusCode,
      lastCheckedAt: updatedMonitor.lastCheckedAt
    });

    if (monitor.status !== finalStatus) {
      ioInstance.emit('monitor:status-change', {
        monitorId: updatedMonitor.id,
        oldStatus: monitor.status,
        newStatus: finalStatus,
        timestamp: updatedMonitor.lastCheckedAt
      });
    }

    if (isNew) {
      ioInstance.emit('incident:new', { incident });
    }
    if (isResolved && Array.isArray(incident)) {
      incident.forEach(inc => {
        ioInstance.emit('incident:resolved', { incidentId: inc.id, resolvedAt: new Date() });
      });
    }
  }

  return { monitor: updatedMonitor, log, incident };
};

export const checkAllMonitors = async (interval = null) => {
  const where = { isActive: true };
  if (interval) {
    where.interval = interval;
  }
  
  const monitors = await prisma.monitor.findMany({ where });
  const results = [];
  
  // Process sequentially to prevent DB lock/connection issues
  for (const monitor of monitors) {
    try {
      const res = await checkMonitor(monitor.id);
      results.push(res);
    } catch (error) {
      console.error(`Error checking monitor ${monitor.id}:`, error);
    }
  }
  
  if (ioInstance) {
    const allActive = await prisma.monitor.findMany({ 
      where: { isActive: true },
      include: {
        logs: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });
    
    const upCount = allActive.filter(m => m.status === 'up').length;
    const downCount = allActive.filter(m => m.status === 'down').length;
    const degradedCount = allActive.filter(m => m.status === 'degraded').length;
    
    const upMonitors = allActive.filter(m => m.status !== 'down');
    let totalResp = 0;
    upMonitors.forEach(m => {
        if(m.logs && m.logs[0]) totalResp += m.logs[0].responseTime;
    });
    const avgResponseTime = upMonitors.length > 0 ? Math.round(totalResp / upMonitors.length) : 0;
    
    const overallUptime = allActive.length > 0 
      ? Number((allActive.reduce((sum, m) => sum + m.uptime, 0) / allActive.length).toFixed(2))
      : 100.0;

    const activeIncidents = await prisma.incident.count({ where: { status: 'active' } });

    ioInstance.emit('dashboard:summary', {
      totalMonitors: allActive.length,
      upCount,
      downCount,
      degradedCount,
      overallUptime,
      avgResponseTime,
      activeIncidents
    });
  }

  return results;
};
