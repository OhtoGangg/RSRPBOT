import { randomUUID } from "crypto";
import type { User, InsertUser, Streamer, InsertStreamer, BotSettings, InsertBotSettings, Activity, InsertActivity } from "../shared/schema.js";

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
  private botSettings: BotSettings | undefined;
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

  async createUser(insertUser: InsertUser) {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllStreamers() { return Array.from(this.streamers.values()); }

  async getStreamer(discordUserId: string) { return this.streamers.get(discordUserId); }

  async createStreamer(insertStreamer: InsertStreamer) {
    const id = randomUUID();
    const streamer: Streamer = {
      id,
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
    this.botSettings = { id: this.botSettings?.id || randomUUID(), ...settings };
    return this.botSettings;
  }

  async getRecentActivities(limit = 50) {
    return this.activities.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)).slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity) {
    const activity: Activity = { ...insertActivity, id: randomUUID(), timestamp: new Date() };
    this.activities.push(activity);
    if (this.activities.length > 1000) this.activities = this.activities.slice(-1000);
    return activity;
  }

  async getActiveStreamsCount() { return Array.from(this.streamers.values()).filter(s => s.isLive).length; }

  async getTotalStreamersCount() { return this.streamers.size; }

  async getTodayAnnouncementsCount() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return this.activities.filter(a => a.type === 'announcement' && a.timestamp && a.timestamp >= today).length;
  }
}

export const storage = new MemStorage();
