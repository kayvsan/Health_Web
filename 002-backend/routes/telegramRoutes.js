import express from 'express';
import { prisma } from '../index.js';
import { testTelegramConnection } from '../services/telegramService.js';

const router = express.Router();

// GET - Ambil semua config
router.get('/', async (req, res) => {
  try {
    const configs = await prisma.telegramConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Mask bot token untuk keamanan (hanya tampilkan 8 karakter terakhir)
    const maskedConfigs = configs.map(config => ({
      ...config,
      botToken: '••••••••' + config.botToken.slice(-8),
    }));
    
    res.json(maskedConfigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Telegram configs' });
  }
});

// POST - Simpan config baru
router.post('/', async (req, res) => {
  try {
    const { label, botToken, chatId, alertOnDown, alertOnDegraded, alertOnRecovery, isActive } = req.body;
    
    const config = await prisma.telegramConfig.create({
        data: {
            label: label || 'Default',
            botToken,
            chatId,
            isActive: isActive ?? true,
            alertOnDown: alertOnDown ?? true,
            alertOnDegraded: alertOnDegraded ?? true,
            alertOnRecovery: alertOnRecovery ?? true,
        },
    });

    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Telegram config' });
  }
});

// PUT - Update config
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { label, botToken, chatId, alertOnDown, alertOnDegraded, alertOnRecovery, isActive } = req.body;
    
    const existing = await prisma.telegramConfig.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ error: 'Config not found' });
    }

    let finalBotToken = botToken;
    // if botToken starts with ••••••••, it means user didn't change it, so use existing
    if (botToken && botToken.startsWith('••••••••')) {
        finalBotToken = existing.botToken;
    }

    const config = await prisma.telegramConfig.update({
        where: { id },
        data: {
            label: label || existing.label,
            botToken: finalBotToken,
            chatId,
            isActive: isActive ?? existing.isActive,
            alertOnDown: alertOnDown ?? existing.alertOnDown,
            alertOnDegraded: alertOnDegraded ?? existing.alertOnDegraded,
            alertOnRecovery: alertOnRecovery ?? existing.alertOnRecovery,
        }
    });

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Telegram config' });
  }
});

// DELETE - Hapus config
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.telegramConfig.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Telegram config' });
  }
});

// POST - Test connection
router.post('/test', async (req, res) => {
  try {
    let { id, botToken, chatId } = req.body;
    
    // if botToken is masked, fetch from db using id
    if (botToken && botToken.startsWith('••••••••') && id) {
        const existing = await prisma.telegramConfig.findUnique({ where: { id } });
        if (existing) botToken = existing.botToken;
    }

    const result = await testTelegramConnection(botToken, chatId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Test failed' });
  }
});

// GET - Notification logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.telegramNotificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
