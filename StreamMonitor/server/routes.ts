import { type Router, type Request, type Response } from "express";
import { IStorage } from "./storage";

export async function registerRoutes(app: Router, storage: IStorage) {
  const router = Router();

  // Test endpoint
  router.get("/api/ping", async (_req: Request, res: Response) => {
    res.json({ message: "pong" });
  });

  // Users
  router.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  router.post("/api/users", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing username or password" });

    const existing = await storage.getUserByUsername(username);
    if (existing)
      return res.status(400).json({ message: "Username already exists" });

    const user = await storage.createUser({ username, password });
    res.json(user);
  });

  // Streamers
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
    if (!discordUserId || !discordUsername)
      return res.status(400).json({ message: "Missing Discord info" });

    const streamer = await storage.createStreamer({ discordUserId, discordUsername, twitchUsername });
    res.json(streamer);
  });

  router.put("/api/streamers/:discordUserId", async (req: Request, res: Response) => {
    const updates = req.body;
    const updated = await storage.updateStreamer(req.params.discordUserId, updates);
    if (!updated) return res.status(404).json({ message: "Streamer not found" });
    res.json(updated);
  });

  router.delete("/api/streamers/:discordUserId", async (req: Request, res: Response) => {
    const deleted = await storage.deleteStreamer(req.params.discordUserId);
    if (!deleted) return res.status(404).json({ message: "Streamer not found" });
    res.json({ success: true });
  });

  // Bot settings
  router.get("/api/bot-settings", async (_req: Request, res: Response) => {
    const settings = await storage.getBotSettings();
    if (!settings) return res.status(404).json({ message: "Bot settings not found" });
    res.json(settings);
  });

  router.put("/api/bot-settings", async (req: Request, res: Response) => {
    const updated = await storage.updateBotSettings(req.body);
    res.json(updated);
  });

  // Activities
  router.get("/api/activities", async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await storage.getRecentActivities(limit);
    res.json(activities);
  });

  router.post("/api/activities", async (req: Request, res: Response) => {
    const activity = await storage.createActivity(req.body);
    res.json(activity);
  });

  // Dashboard stats
  router.get("/api/stats", async (_req: Request, res: Response) => {
    const stats = {
      activeStreams: await storage.getActiveStreamsCount(),
      totalStreamers: await storage.getTotalStreamersCount(),
      todayAnnouncements: await storage.getTodayAnnouncementsCount(),
    };
    res.json(stats);
  });

  app.use(router);
  return app;
}
