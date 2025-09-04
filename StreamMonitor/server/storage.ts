// server/storage.ts
import { randomUUID } from 'crypto';

export interface Streamer {
  id: string;
  discordUserId: string;
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean | null;
  currentStreamTitle: string | null;
  currentViewers: number | null;
  lastChecked: Date | null;
  announcementMessageId: string | null;
}

export interface BotSettings {
  id: string;
  watchedRoleId: string;
  liveRoleId: string;
  announceChannelId: string;
  checkIntervalSeconds: number;
  isActive: boolean;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

export class MemStorage {
  public streamers: Map<string, Streamer>;
  private botSettings: BotSettings | undefined;
  private activities: Activity[];

  constructor() {
    this.streamers = new Map();
    this.activities = [];
    this.botSettings = {
      id: randomUUID(),
      watchedRoleId: process.env.WATCHED_ROLE_ID || '',
      liveRoleId: process.env.LIVE_ROLE_ID || '',
      announceChannelId: process.env.ANNOUNCE_CHANNEL_ID || '',
      checkIntervalSeconds: 60,
      isActive: true,
    };
  }

  // Bot settings
  async getBotSettings(): Promise<BotSettings | undefined> {
    return this.botSettings;
  }

  async updateBotSettings(settings: Partial<BotSettings>): Promise<BotSettings> {
    this.botSettings = { ...this.botSettings, ...settings } as BotSettings;
    return this.botSettings;
  }

  // Streamers
  async getStreamer(discordUserId: string): Promise<Streamer | undefined> {
    return this.streamers.get(discordUserId);
  }

  async getAllStreamers(): Promise<Streamer[]> {
    return Array.from(this.streamers.values());
  }

  async createStreamer(data: Partial<Streamer> & { discordUserId: string; discordUsername: string }): Promise<Streamer> {
    const streamer: Streamer = {
      id: randomUUID(),
      discordUserId: data.discordUserId,
      discordUsername: data.discordUsername,
      twitchUsername: data.twitchUsername ?? null,
      isLive: data.isLive ?? false,
      currentStreamTitle: data.currentStreamTitle ?? null,
      currentViewers: data.currentViewers ?? 0,
      announcementMessageId: data.announcementMessageId ?? null,
      lastChecked: new Date(),
    };
    this.streamers.set(streamer.discordUserId, streamer);
    return streamer;
  }

  async updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>): Promise<Streamer | undefined> {
    const existing = this.streamers.get(discordUserId);
    if (!existing) return undefined;
    const updated: Streamer = { ...existing, ...updates, lastChecked: new Date() };
    this.streamers.set(discordUserId, updated);
    return updated;
  }

  // Activities
  async createActivity(activity: Omit<Activity, 'id' | 'timestamp'> & { type: string }): Promise<Activity> {
    const act: Activity = { ...activity, id: randomUUID(), timestamp: new Date() };
    this.activities.push(act);
    if (this.activities.length > 1000) this.activities = this.activities.slice(-1000);
    return act;
  }

  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    return this.activities.slice(-limit).reverse();
  }
}

export const storage = new MemStorage();
