// server/routes.ts
import express from 'express';
import { storage } from './storage.js';
import { DiscordBot } from './services/discord-bot.js';

export const router = express.Router();

// Status endpoint
router.get('/status', async (_req, res) => {
  try {
    const botStatus = {
      isOnline: true, // TODO: Kysy oikeasti DiscordBotilta tarvittaessa
      botSettings: await storage.getBotSettings()
    };
    res.json(botStatus);
  } catch (err) {
    console.error('Error fetching status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example endpoint to update bot settings
router.post('/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    await storage.updateBotSettings(newSettings);

    // TODO: Jos haluat, voit herättää DiscordBotin uudelleen käynnistämään monitoringin
    // discordBot.updateSettings(newSettings);

    res.json({ success: true, updatedSettings: newSettings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
