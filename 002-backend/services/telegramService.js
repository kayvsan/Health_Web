import axios from 'axios';
import { prisma } from '../index.js';

// Emoji mapping for alert types
const ALERT_ICONS = {
  down: '🔴',
  degraded: '🟡',
  recovery: '🟢',
};

/**
 * Format pesan Telegram (HTML parse mode)
 */
const formatAlertMessage = (type, monitor, details = {}) => {
  const icon = ALERT_ICONS[type] || '⚪';
  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  if (type === 'down') {
    return [
      `${icon} <b>MONITOR DOWN</b>`,
      ``,
      `<b>Monitor:</b> ${monitor.name}`,
      `<b>URL:</b> <code>${monitor.url}</code>`,
      `<b>Error:</b> ${details.errorMessage || 'Unknown error'}`,
      `<b>Status Code:</b> ${details.statusCode || 'N/A'}`,
      `<b>Severity:</b> 🔥 CRITICAL`,
      ``,
      `⏰ <i>${timestamp}</i>`,
    ].join('\n');
  }

  if (type === 'degraded') {
    return [
      `${icon} <b>PERFORMANCE DEGRADED</b>`,
      ``,
      `<b>Monitor:</b> ${monitor.name}`,
      `<b>URL:</b> <code>${monitor.url}</code>`,
      `<b>Response Time:</b> ${details.responseTime}ms`,
      `<b>Severity:</b> ⚠️ WARNING`,
      ``,
      `⏰ <i>${timestamp}</i>`,
    ].join('\n');
  }

  if (type === 'recovery') {
    return [
      `${icon} <b>MONITOR RECOVERED</b>`,
      ``,
      `<b>Monitor:</b> ${monitor.name}`,
      `<b>URL:</b> <code>${monitor.url}</code>`,
      `<b>Status:</b> ✅ Back Online`,
      `<b>Response Time:</b> ${details.responseTime || 'N/A'}ms`,
      ``,
      `⏰ <i>${timestamp}</i>`,
    ].join('\n');
  }

  return `${icon} Alert for ${monitor.name}`;
};

/**
 * Kirim pesan ke Telegram Bot API
 */
const sendTelegramMessage = async (botToken, chatId, message) => {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  return response.data;
};

/**
 * Kirim alert ke semua Telegram config yang aktif
 */
export const sendTelegramAlert = async (type, monitor, details = {}, incidentId = null) => {
  try {
    // Ambil semua config yang aktif
    const configs = await prisma.telegramConfig.findMany({
      where: { isActive: true },
    });

    if (configs.length === 0) return;

    // Filter eligible configs based on alert preferences
    const eligibleConfigs = configs.filter((config) => {
      if (type === 'down') return config.alertOnDown;
      if (type === 'degraded') return config.alertOnDegraded;
      if (type === 'recovery') return config.alertOnRecovery;
      return false;
    });

    if (eligibleConfigs.length === 0) return;

    // Deduplication: avoid sending the same down/degraded alert repeatedly
    // Fetch the most recent successful alert for this monitor
    const latestLog = await prisma.telegramNotificationLog.findFirst({
      where: {
        monitorId: monitor.id,
        success: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    // If the latest alert is of the same type (down or degraded) and not a recovery, skip sending
    if (latestLog && latestLog.type === type && type !== 'recovery') {
      console.log(`[Deduplication] Skipping duplicate ${type} alert for ${monitor.name}`);
      return;
    }

    const message = formatAlertMessage(type, monitor, details);

    // Kirim ke semua config yang eligible
    for (const config of eligibleConfigs) {
      try {
        // Rate Limiting: recovery selalu dikirim, down/degraded dibatasi 30 menit
        if (type !== 'recovery') {
          const cooldownMs = 30 * 60 * 1000; // 30 menit
          const cooldownAgo = new Date(Date.now() - cooldownMs);
          const recentLog = await prisma.telegramNotificationLog.findFirst({
            where: {
              telegramConfigId: config.id,
              monitorId: monitor.id,
              type: type,
              sentAt: { gte: cooldownAgo },
              success: true
            }
          });

          if (recentLog) {
            const nextAllowed = new Date(recentLog.sentAt.getTime() + cooldownMs);
            const remaining = Math.ceil((nextAllowed - Date.now()) / 60000);
            console.log(`[Rate Limit] Skipping ${type} alert for ${monitor.name} to config ${config.id} (next allowed in ~${remaining} min)`);
            continue;
          }
        }

        await sendTelegramMessage(config.botToken, config.chatId, message);

        // Log sukses
        await prisma.telegramNotificationLog.create({
          data: {
            telegramConfigId: config.id,
            incidentId,
            monitorId: monitor.id,
            monitorName: monitor.name,
            type,
            message,
            success: true,
          },
        });
      } catch (err) {
        console.error(`Failed to send Telegram alert to config ${config.id}:`, err.message);

        // Log gagal
        await prisma.telegramNotificationLog.create({
          data: {
            telegramConfigId: config.id,
            incidentId,
            monitorId: monitor.id,
            monitorName: monitor.name,
            type,
            message,
            success: false,
            errorMessage: err.message,
          },
        });
      }
    }
  } catch (err) {
    console.error('Telegram alert service error:', err.message);
  }
};

/**
 * Test koneksi Telegram (untuk validasi di Settings)
 */
export const testTelegramConnection = async (botToken, chatId) => {
  try {
    const message = [
      `✅ <b>Connection Test Successful!</b>`,
      ``,
      `Health Monitor Alert system is now connected.`,
      `⏰ <i>${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</i>`,
    ].join('\n');

    await sendTelegramMessage(botToken, chatId, message);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
