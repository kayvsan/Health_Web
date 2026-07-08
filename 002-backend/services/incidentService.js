import { prisma } from '../index.js';
import { sendTelegramAlert } from './telegramService.js';

export const evaluateAndManageIncident = async (monitor, probeResult, newStatus) => {
  let isNew = false;
  let isResolved = false;
  let activeIncident = null;

  // Find active incidents for this monitor
  const activeIncidents = await prisma.incident.findMany({
    where: {
      monitorId: monitor.id,
      status: 'active'
    }
  });

  if (newStatus === 'down') {
    const existingDowntime = activeIncidents.find(i => i.type === 'downtime');
    if (!existingDowntime) {
      // Check for 5 consecutive downs
      const recentLogs = await prisma.monitorLog.findMany({
        where: { monitorId: monitor.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      const isConsistentlyDown = recentLogs.length === 5 && recentLogs.every(log => log.status === 'down');

      if (isConsistentlyDown) {
        activeIncident = await prisma.incident.create({
          data: {
            monitorId: monitor.id,
            type: 'downtime',
            severity: 'critical',
            message: probeResult.errorMessage || 'Monitor went offline',
            status: 'active'
          }
        });
        isNew = true;
        
        // Send Telegram Alert
        await sendTelegramAlert('down', monitor, {
          errorMessage: probeResult.errorMessage,
          statusCode: probeResult.statusCode,
        }, activeIncident.id);
      }
    } else {
      activeIncident = existingDowntime;
    }
  } else if (newStatus === 'degraded') {
    const existingDegraded = activeIncidents.find(i => i.type === 'slow_response');
    if (!existingDegraded) {
      activeIncident = await prisma.incident.create({
        data: {
          monitorId: monitor.id,
          type: 'slow_response',
          severity: 'warning',
          message: `Response time spiked to ${probeResult.responseTime}ms`,
          status: 'active'
        }
      });
      isNew = true;
      
      // Send Telegram Alert
      await sendTelegramAlert('degraded', monitor, {
        responseTime: probeResult.responseTime,
      }, activeIncident.id);
    } else {
      activeIncident = existingDegraded;
    }
  } else if (newStatus === 'up') {
    // Resolve any active incidents
    if (activeIncidents.length > 0) {
      await prisma.incident.updateMany({
        where: {
          id: { in: activeIncidents.map(i => i.id) }
        },
        data: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      });
      isResolved = true;
      activeIncident = activeIncidents; // Return array of resolved incidents if needed
      
      // Send Telegram Alert
      await sendTelegramAlert('recovery', monitor, {
        responseTime: probeResult.responseTime,
      });
    }
  }

  return { incident: activeIncident, isNew, isResolved };
};
