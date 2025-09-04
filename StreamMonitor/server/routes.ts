// server/routes.ts
import express from "express";
import { storage } from "./storage.js";

export const router = express.Router();

router.get("/bot-settings", async (_req, res) => {
  const settings = await storage.botSettings.get();
  res.json(settings);
});

router.post("/bot-settings", async (req, res) => {
  const updated = await storage.botSettings.update(req.body);
  res.json(updated);
});

router.get("/streamers", async (_req, res) => {
  const all = await storage.streamers.getAll();
  res.json(all);
});
