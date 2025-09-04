// server/routes.ts
import express from 'express';
import { storage } from './storage.js';
import { DiscordBot } from './services/discord-bot.js';

export function setupRoutes(app: express.Express, discordBot: DiscordBot) {
  app.get('/status', async (_req, res) => {
    const botSettings = await storage.getBotSettings();
    res.json({ isActive: botSettings?.isActive ?? false });
  });

  app.post('/update-settings', async (req, res) => {
    const newSettings = req.body;
    await discordBot.initialize(); // optional re-init
    res.json({ success: true });
  });
}

// --- Bot status ---
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const discordBot = new DiscordBot();
    const status = await discordBot.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// --- Update bot settings ---
router.post('/settings', async (req: Request, res: Response) => {
  try {
    const newSettings: InsertBotSettings = req.body;
    await storage.updateBotSettings(newSettings);

    const discordBot = new DiscordBot();
    if (discordBot) {
      await discordBot.updateSettings(newSettings);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Get all streamers ---
router.get('/streamers', async (_req: Request, res: Response) => {
  try {
    const allStreamers = Array.from(storage['streamers'].values());
    res.json(allStreamers);
  } catch (error) {
    console.error('Error getting streamers:', error);
    res.status(500).json({ error: 'Failed to get streamers' });
  }
});

// --- Get single streamer ---
router.get('/streamers/:discordUserId', async (req: Request, res: Response) => {
  try {
    const streamer = await storage.getStreamer(req.params.discordUserId);
    if (!streamer) {
      return res.status(404).json({ error: 'Streamer not found' });
    }
    res.json(streamer);
  } catch (error) {
    console.error('Error getting streamer:', error);
    res.status(500).json({ error: 'Failed to get streamer' });
  }
});
