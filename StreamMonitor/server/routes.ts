import express, { type Request, type Response, type Router } from "express";
import { storage } from "./storage.js";

export async function registerRoutes(app: express.Express, _storage = storage): Promise<express.Express> {
  const router: Router = express.Router();

  // ========== USER ROUTES ==========
  router.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  router.post("/api/users", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing username or password" });
    const existing = await storage.getUserByUsername(username);
    if (existing) return res.status(409).json({ message: "User already exists" });
    const user = await storage.createUser({ username, password });
    res.json(user);
  });

  // ========== STREAMER ROUTES ==========
  router.get("/api/streamers", async (_req: Request, res: Response) => {
    const streamers = await storage.getAllStreamers();
    res.json(streamers);
  });

  router.get("/api/streamers/:discordUserId", async (req: Request, res: Response) => {
    const streamer = await storage.getStreamer(req.params.discordUserId);
    if (!streamer) return res.status(404).json({ message: "Streamer not found" });
    res.json(streamer);
  });

  router.post("/api/streamers", async (req: Request, res: Response) => {
    const { discordUserId, discordUsername, twitchUsername } = req.body;
    if (!discordUserId || !discordUsername) return res.status(400).json({ message: "Missing required fields" });
    const streamer = await storage.createStreamer({ discordUserId, discordUsername, twitchUsername });
    res.json(streamer);
  });

  router.patch("/api/streamers/:discordUserId", async (req: Request, res: Response) => {
    const updates = req.body;
    const updated = await storage.updateStreamer(req.params.discordUserId, updates);
    if (!updated) return res.status(404).json({ message: "Streamer not found" });
    res.json(updated);
  });

  router.delete("/api/streamers/:discordUserId", async (req: Request, res: Response) => {
    const success = await storage.deleteStreamer(req.params.discordUserId);
    if (!success) return res.status(404).json({ message: "Streamer not found" });
    res.json({ message: "Deleted successfully" });
  });

  // ========== BOT SETTINGS ROUTES ==========
  router.get("/api/bot-settings", async (_req: Request, res: Response) => {
    const settings = await storage.getBotSettings();
    res.json(settings);
  });

  router.patch("/api/bot-settings", async (req: Request, res: Response) => {
    const updates = req.body;
    const updated = await storage.updateBotSettings(updates);
    res.json(updated);
  });

  // ========== ACTIVITY ROUTES ==========
  router.get("/api/activities", async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await storage.getRecentActivities(limit);
    res.json(activities);
  });

  router.post("/api/activities", async (req: Request, res: Response) => {
    const { type, message, userId } = req.body;
    if (!type || !message || !userId) return res.status(400).json({ message: "Missing required fields" });
    const activity = await storage.createActivity({ type, message, userId });
    res.json(activity);
  });

  // ========== DASHBOARD STATS ==========
  router.get("/api/stats", async (_req: Request, res: Response) => {
    const activeStreams = await storage.getActiveStreamsCount();
    const totalStreamers = await storage.getTotalStreamersCount();
    const todayAnnouncements = await storage.getTodayAnnouncementsCount();
    res.json({ activeStreams, totalStreamers, todayAnnouncements });
  });

  app.use(router);
  return app;
}
