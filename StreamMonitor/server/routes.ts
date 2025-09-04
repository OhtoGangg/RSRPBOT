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
    await storage.updateBotSettings(newSettings);
    if (discordBot) await discordBot.updateSettings(newSettings);
    res.json({ success: true });
  });

  app.get('/streamers', async (_req, res) => {
    const allStreamers = await storage.getAllStreamers();
    res.json(allStreamers);
  });

  app.get('/streamers/:discordUserId', async (req, res) => {
    const streamer = await storage.getStreamer(req.params.discordUserId);
    if (!streamer) return res.status(404).json({ error: 'Streamer not found' });
    res.json(streamer);
  });
}
