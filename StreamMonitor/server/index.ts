// server/routes.ts
import { Router } from "express";
import { storage } from "./storage.js";
import { DiscordBot } from "./services/discord-bot.js";

export const router = Router();

// Test endpoint
router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// Bot status
router.get("/status", async (_req, res) => {
  const botSettings = await storage.getBotSettings();
  res.json({ isActive: botSettings?.isActive ?? false });
});

// Update bot settings
router.post("/update-settings", async (req, res) => {
  const newSettings = req.body;
  await storage.updateBotSettings(newSettings);
  // DiscordBot singleton haetaan index.ts:stä (ei tuoda tänne)
  res.json({ success: true });
});

// Get all streamers
router.get("/streamers", async (_req, res) => {
  const allStreamers = await storage.getAllStreamers();
  res.json(allStreamers);
});

// Get one streamer
router.get("/streamers/:discordUserId", async (req, res) => {
  const streamer = await storage.getStreamer(req.params.discordUserId);
  if (!streamer) return res.status(404).json({ error: "Streamer not found" });
  res.json(streamer);
});
