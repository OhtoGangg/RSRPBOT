// server/storage.ts
import { randomUUID } from 'crypto';
import { type InsertBotSettings, type BotSettings, type InsertStreamer, type Streamer, type InsertActivity, type Activity } from '@shared/schema';

export interface IStorage {
  getBotSettings(): Promise<BotSettings | undefined>;
  updateBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  getStreamer(discordUserId: string): Promise<Streamer | undefined>;
  createStreamer(streamer: InsertStreamer): Promise<Streamer>;
  updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>): Promise<Streamer | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private streamers: Map<string, Streamer>;
  private botSettings: BotSettings | undefined;
  private activities: Activity[];

  constructor() {
    this.streamers = new Map();
    this.activities = [];

    this.botSettings = {
      id: randomUUID(),
      watchedRoleId: process.env.STRIIMAAJA_ROLE_ID || 'STRIIMAAJA',
      liveRoleId: process.env.LIVE_ROLE_ID || 'LIVESSÄ',
      announceChannelId: process.env.ANNOUNCE_CHANNEL_ID || 'mainostus',
      checkIntervalSeconds: 60,
      isActive: true,
    };
  }

  // Bot settings
  async getBotSettings(): Promise<BotSettings | undefined> {
    return this.botSettings;
  }

  async updateBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    this.botSettings = {
      id: this.botSettings?.id || randomUUID(),
      watchedRoleId: settings.watchedRoleId,
      liveRoleId: settings.liveRoleId,
      announceChannelId: settings.announceChannelId,
      checkIntervalSeconds: settings.checkIntervalSeconds ?? 60,
      isActive: settings.isActive ?? true,
    };
    return this.botSettings;
  }

  // Streamers
  async getStreamer(discordUserId: string): Promise<Streamer | undefined> {
    return this.streamers.get(discordUserId);
  }

  async createStreamer(insertStreamer: InsertStreamer): Promise<Streamer> {
    const streamer: Streamer = {
      id: randomUUID(),
      discordUserId: insertStreamer.discordUserId,
      discordUsername: insertStreamer.discordUsername,
      twitchUsername: insertStreamer.twitchUsername ?? null,
      isLive: insertStreamer.isLive ?? false,
      currentStreamTitle: insertStreamer.currentStreamTitle ?? null,
      currentViewers: insertStreamer.currentViewers ?? 0,
      announcementMessageId: insertStreamer.announcementMessageId ?? null,
      lastChecked: new Date(),
    };
    this.streamers.set(insertStreamer.discordUserId, streamer);
    return streamer;
  }

  async updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>): Promise<Streamer | undefined> {
    const existing = this.streamers.get(discordUserId);
    if (!existing) return undefined;

    const updated: Streamer = {
      ...existing,
      ...updates,
      lastChecked: new Date(),
    };

    this.streamers.set(discordUserId, updated);
    return updated;
  }

  // Activities
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      id: randomUUID(),
      ...insertActivity,
      timestamp: new Date(),
    };
    this.activities.push(activity);

    // Keep only last 1000 activities
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }

    return activity;
  }

  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    return this.activities
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
