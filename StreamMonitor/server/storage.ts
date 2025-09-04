// server/storage.ts
import { randomUUID } from 'crypto';
import { type InsertBotSettings, type BotSettings, type InsertActivity, type Activity, type InsertStreamer, type Streamer } from '../shared/schema.js';

export class MemStorage {
  private streamers: Map<string, Streamer> = new Map();
  private botSettings: BotSettings | undefined;
  private activities: Activity[] = [];

  constructor() {
    this.botSettings = {
      id: randomUUID(),
      watchedRoleId: process.env.WATCHED_ROLE_ID || 'STRIIMAAJA_ROLE_ID',
      liveRoleId: process.env.LIVE_ROLE_ID || 'LIVESSÄ_ROLE_ID',
      announceChannelId: process.env.ANNOUNCE_CHANNEL_ID || 'MAINOSTUS_CHANNEL_ID',
      checkIntervalSeconds: 60,
      isActive: true,
    };
  }

  // Bot settings
  async getBotSettings(): Promise<BotSettings> {
    return this.botSettings!;
  }

  async updateBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    this.botSettings = { ...this.botSettings!, ...settings };
    return this.botSettings;
  }

  // Streamers
  async getStreamer(discordUserId: string): Promise<Streamer | undefined> {
    return this.streamers.get(discordUserId);
  }

  async createStreamer(streamer: InsertStreamer): Promise<Streamer> {
    const newStreamer: Streamer = {
      ...streamer,
      id: randomUUID(),
      isLive: streamer.isLive ?? false,
      currentViewers: streamer.currentViewers ?? 0,
      currentStreamTitle: streamer.currentStreamTitle ?? null,
      announcementMessageId: streamer.announcementMessageId ?? null,
      lastChecked: new Date(),
    };
    this.streamers.set(streamer.discordUserId, newStreamer);
    return newStreamer;
  }

  async updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>): Promise<Streamer | undefined> {
    const existing = this.streamers.get(discordUserId);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, lastChecked: new Date() };
    this.streamers.set(discordUserId, updated);
    return updated;
  }

  // Activities
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = { ...activity, id: randomUUID(), timestamp: new Date() };
    this.activities.push(newActivity);
    if (this.activities.length > 1000) this.activities = this.activities.slice(-1000);
    return newActivity;
  }
}

export const storage = new MemStorage();
