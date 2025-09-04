/// <reference types="node" />
import { randomUUID } from "crypto";
import type {
  User,
  InsertUser,
  Streamer,
  InsertStreamer,
  BotSettings,
  InsertBotSettings,
  Activity,
  InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Streamer methods
  getAllStreamers(): Promise<Streamer[]>;
  getStreamer(discordUserId: string): Promise<Streamer | undefined>;
  createStreamer(streamer: InsertStreamer): Promise<Streamer>;
  updateStreamer(
    discordUserId: string,
    updates: Partial<Omit<Streamer, "id" | "discordUserId">>
  ): Promise<Streamer | undefined>;
  deleteStreamer(discordUserId: string): Promise<boolean>;

  // Bot settings methods
  getBotSettings(): Promise<BotSettings | undefined>;
  updateBotSettings(settings: InsertBotSettings): Promise<BotSettings>;

  // Activity methods
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Dashboard stats
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
    // Initialize default bot settings
    this.botSettings = {
      id: randomUUID(),
      watchedRoleId: process.env.STRIIMAAJA_ROLE_ID || "STRIIMAAJA_ROLE_ID",
      liveRoleId: process.env.LIVESSA_ROLE_ID || "LIVESSÄ_ROLE_ID",
      announceChannelId: process.env.MAINOSTUS_CHANNEL_ID || "MAINOSTUS_CHANNEL_ID",
      checkIntervalSeconds: 60,
      isActive: true,
    };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Streamer methods
  async getAllStreamers(): Promise<Streamer[]> {
    return Array.from(this.streamers.values());
  }

  async getStreamer(discordUserId: string): Promise<Streamer | undefined> {
    return this.streamers.get(discordUserId);
  }

  async createStreamer(insertStreamer: InsertStreamer): Promise<Streamer> {
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

  async updateStreamer(
    discordUserId: string,
    updates: Partial<Omit<Streamer, "id" | "discordUserId">>
  ): Promise<Streamer | undefined> {
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

  async deleteStreamer(discordUserId: string): Promise<boolean> {
    return this.streamers.delete(discordUserId);
  }

  // Bot settings methods
  async getBotSettings(): Promise<BotSettings | undefined> {
    return this.botSettings;
  }

  async updateBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
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

  // Activity methods
  async getRecentActivities(limit = 50): Promise<Activity[]> {
    return [...this.activities]
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      timestamp: new Date(),
    };
    this.activities.push(activity);

    // Keep only last 1000 activities
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }
    return activity;
  }

  // Dashboard stats
  async getActiveStreamsCount(): Promise<number> {
    return Array.from(this.streamers.values()).filter(s => s.isLive).length;
  }

  async getTotalStreamersCount(): Promise<number> {
    return this.streamers.size;
  }

  async getTodayAnnouncementsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.activities.filter(a => a.type === "announcement" && a.timestamp && a.timestamp >= today).length;
  }
}

export const storage = new MemStorage();
