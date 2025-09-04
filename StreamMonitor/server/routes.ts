import express from "express";
import storage from "./storage.js";
import { bot } from "./services/discord-bot.js";
import { schema } from "@shared/schema"; // varmistettu tsconfig-pathsilla

const router = express.Router();

// Esimerkki reitistä
router.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

// Lisää muut reitit täällä, tyypit eksplisiittisesti
router.post("/data", (req, res) => {
  const s: any = req.body;
  storage.save(s);
  res.json({ success: true });
});

export default router;
