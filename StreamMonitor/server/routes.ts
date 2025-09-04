// server/routes.ts
import express, { type Router } from 'express';
import { storage } from './storage.js';
import { DiscordBot } from './services/discord-bot.js';

export function setupRoutes(app: express.Express, discordBot: DiscordBot) {
  // --- Bot status ---
  app.get('/status', async (_req, res) => {
    try {
      const status = await discordBot.getStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  // --- Update bot settings ---
  app.post('/settings', async (req, res) => {
    try {
      const newSettings = req.body;
      await storage.updateBotSettings(newSettings);
      await discordBot.updateSettings(newSettings);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // --- Get all streamers ---
  app.get('/streamers', async (_req, res) => {
    try {
      const allStreamers = await storage.getAllStreamers?.() ?? [];
      res.json(allStreamers);
    } catch (error) {
      console.error('Error getting streamers:', error);
      res.status(500).json({ error: 'Failed to get streamers' });
    }
  });

  // --- Get single streamer ---
  app.get('/streamers/:discordUserId', async (req, res) => {
    try {
      const streamer = await storage.getStreamer(req.params.discordUserId);
      if (!streamer) return res.status(404).json({ error: 'Streamer not found' });
      res.json(streamer);
    } catch (error) {
      console.error('Error getting streamer:', error);
      res.status(500).json({ error: 'Failed to get streamer' });
    }
  });
}
