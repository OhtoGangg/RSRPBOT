import { type InsertBotSettings, type Streamer, type InsertStreamer, type Activity, type InsertActivity } from '../shared/schema.js';
import { randomUUID } from 'crypto';

interface StorageData {
  botSettings: InsertBotSettings;
  streamers: Streamer[];
  activities: Activity[];
}

class MemStorage {
  private botSettings: InsertBotSettings;
  private streamers: Streamer[] = [];
  private activities: Activity[] = [];

  constructor() {
    this.botSettings = {
      watchedRoleId: process.env.WATCHED_ROLE_ID || 'STRIIMAAJA_ROLE_ID',
      liveRoleId: process.env.LIVE_ROLE_ID || 'LIVESSÄ_ROLE_ID',
      announceChannelId: process.env.ANNOUNCE_CHANNEL_ID || 'MAINOSTUS_CHANNEL_ID',
      checkIntervalSeconds: 60,
      isActive: true,
    };
  }

  async getBotSettings(): Promise<InsertBotSettings> {
    return this.botSettings;
  }

  async updateBotSettings(settings: InsertBotSettings) {
    this.botSettings = { ...this.botSettings, ...settings };
  }

  async getStreamer(discordUserId: string): Promise<Streamer | undefined> {
    return this.streamers.find(s => s.discordUserId === discordUserId);
  }

  async createStreamer(streamer: InsertStreamer): Promise<Streamer> {
    const newStreamer: Streamer = { id: randomUUID(), ...streamer, lastChecked: new Date() };
    this.streamers.push(newStreamer);
    return newStreamer;
  }

  async updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>): Promise<Streamer | undefined> {
    const streamer = await this.getStreamer(discordUserId);
    if (!streamer) return undefined;
    Object.assign(streamer, updates);
    streamer.lastChecked = new Date();
    return streamer;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = { ...activity, id: randomUUID(), timestamp: new Date() };
    this.activities.push(newActivity);
    if (this.activities.length > 1000) this.activities = this.activities.slice(-1000);
    return newActivity;
  }
}

export const storage = new MemStorage();
