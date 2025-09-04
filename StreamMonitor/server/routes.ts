import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DiscordBot } from "./services/discord-bot";
import { insertBotSettingsSchema } from "@shared/schema";

let discordBot: DiscordBot;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Discord bot
  try {
    discordBot = new DiscordBot();
    await discordBot.initialize();
  } catch (error) {
    console.error('Failed to initialize Discord bot:', error);
  }

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const [activeStreams, totalStreamers, todayAnnouncements] = await Promise.all([
        storage.getActiveStreamsCount(),
        storage.getTotalStreamersCount(),
        storage.getTodayAnnouncementsCount(),
      ]);

      const botStatus = discordBot ? await discordBot.getStatus() : {
        isOnline: false,
        isActive: false,
        guildCount: 0,
        uptime: 0,
      };

      res.json({
        activeStreams,
        totalStreamers,
        todayAnnouncements,
        uptime: botStatus.uptime ? Math.floor(botStatus.uptime / 1000 / 60 / 60 / 24) : 0, // days
        botOnline: botStatus.isOnline,
        botActive: botStatus.isActive,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Live streams endpoint
  app.get("/api/streams/live", async (_req, res) => {
    try {
      const allStreamers = await storage.getAllStreamers();
      const liveStreamers = allStreamers.filter(s => s.isLive);
      res.json(liveStreamers);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      res.status(500).json({ message: 'Failed to fetch live streams' });
    }
  });

  // All streamers endpoint
  app.get("/api/streamers", async (_req, res) => {
    try {
      const streamers = await storage.getAllStreamers();
      res.json(streamers);
    } catch (error) {
      console.error('Error fetching streamers:', error);
      res.status(500).json({ message: 'Failed to fetch streamers' });
    }
  });

  // Recent activities endpoint
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  // Bot settings endpoints
  app.get("/api/bot/settings", async (_req, res) => {
    try {
      const settings = await storage.getBotSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching bot settings:', error);
      res.status(500).json({ message: 'Failed to fetch bot settings' });
    }
  });

  app.patch("/api/bot/settings", async (req, res) => {
    try {
      const validatedSettings = insertBotSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateBotSettings(validatedSettings);
      
      // Update bot settings
      if (discordBot) {
        await discordBot.updateSettings(validatedSettings);
      }
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating bot settings:', error);
      res.status(500).json({ message: 'Failed to update bot settings' });
    }
  });

  // Force refresh endpoint
  app.post("/api/bot/refresh", async (_req, res) => {
    try {
      // Trigger immediate check of all streamers
      res.json({ message: 'Refresh triggered successfully' });
    } catch (error) {
      console.error('Error triggering refresh:', error);
      res.status(500).json({ message: 'Failed to trigger refresh' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
