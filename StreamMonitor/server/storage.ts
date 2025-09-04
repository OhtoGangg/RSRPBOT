import { randomUUID } from "crypto";
import type { 
  User, InsertUser, 
  Streamer, InsertStreamer, 
  BotSettings, InsertBotSettings, 
  Activity, InsertActivity 
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllStreamers(): Promise<Streamer[]>;
  getStreamer(discordUserId: string): Promise<Streamer | undefined>;
  createStreamer(streamer: InsertStreamer): Promise<Streamer>;
  updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>): Promise<Streamer | undefined>;
  deleteStreamer(discordUserId: string): Promise<boolean>;

  getBotSettings(): Promise<BotSettings | undefined>;
  updateBotSettings(settings: InsertBotSettings): Promise<BotSettings>;

  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  getActiveStreamsCount(): Promise<number>;
  getTotalStreamersCount(): Promise<number>;
  getTodayAnnouncementsCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private streamers = new Map<string, Streamer>();
  private botSettings?: BotSettings;
  private activities: Activity[] = [];

  constructor() {
    this.botSettings = {
      id: randomUUID(),
      watchedRoleId: "STRIIMAAJA_ROLE_ID",
      liveRoleId: "LIVESSÄ_ROLE_ID",
      announceChannelId: "MAINOSTUS_CHANNEL_ID",
      checkIntervalSeconds: 60,
      isActive: true,
    };
  }

  async getUser(id: string) { return this.users.get(id); }

  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(user: InsertUser) {
    const id = randomUUID();
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllStreamers() { return Array.from(this.streamers.values()); }

  async getStreamer(discordUserId: string) { return this.streamers.get(discordUserId); }

  async createStreamer(streamer: InsertStreamer) {
    const id = randomUUID();
    const newStreamer: Streamer = {
      id,
      discordUserId: streamer.discordUserId,
      discordUsername: streamer.discordUsername,
      twitchUsername: streamer.twitchUsername ?? null,
      isLive: streamer.isLive ?? false,
      currentStreamTitle: streamer.currentStreamTitle ?? null,
      currentViewers: streamer.currentViewers ?? 0,
      announcementMessageId: streamer.announcementMessageId ?? null,
      lastChecked: new Date(),
    };
    this.streamers.set(streamer.discordUserId, newStreamer);
    return newStreamer;
  }

  async updateStreamer(discordUserId: string, updates: Partial<Omit<Streamer, 'id' | 'discordUserId'>>) {
    const existing = this.streamers.get(discordUserId);
    if (!existing) return undefined;
    const updated: Streamer = { ...existing, ...updates, lastChecked: new Date() };
    this.streamers.set(discordUserId, updated);
    return updated;
  }

  async deleteStreamer(discordUserId: string) { return this.streamers.delete(discordUserId); }

  async getBotSettings() { return this.botSettings; }

  async updateBotSettings(settings: InsertBotSettings) {
    this.botSettings = {
      id: this.botSettings?.id ?? randomUUID(),
      watchedRoleId: settings.watchedRoleId,
      liveRoleId: settings.liveRoleId,
      announceChannelId: settings.announceChannelId,
      checkIntervalSeconds: settings.checkIntervalSeconds ?? 60,
      isActive: settings.isActive ?? true,
    };
    return this.botSettings;
  }

  async getRecentActivities(limit = 50) {
    return this.activities
      .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity) {
    const id = randomUUID();
    const newActivity: Activity = { ...activity, id, timestamp: new Date() };
    this.activities.push(newActivity);
    if (this.activities.length > 1000) this.activities = this.activities.slice(-1000);
    return newActivity;
  }

  async getActiveStreamsCount() {
    return Array.from(this.streamers.values()).filter(s => s.isLive).length;
  }

  async getTotalStreamersCount() { return this.streamers.size; }

  async getTodayAnnouncementsCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.activities.filter(a => a.type === 'announcement' && a.timestamp && a.timestamp >= today).length;
  }
}

export const storage = new MemStorage();
