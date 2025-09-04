// server/storage.ts
import { db } from './db.js'; // olettaen, että Drizzle ORM setup on db.js:ssä
import { streamers, botSettings, activities, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

export const storage = {
  // --- Users ---
  async getUser(username: string) {
    return db.select().from(users).where(eq(users.username, username)).get();
  },

  async createUser(data: { username: string; password: string }) {
    return db.insert(users).values(data).returning().get();
  },

  // --- Streamers ---
  async getAllStreamers() {
    return db.select().from(streamers).all();
  },

  async getStreamer(discordUserId: string) {
    return db.select().from(streamers).where(eq(streamers.discordUserId, discordUserId)).get();
  },

  async createStreamer(data: {
    id: string;
    discordUserId: string;
    discordUsername: string;
    twitchUsername: string | null;
    isLive: boolean;
    currentStreamTitle: string | null;
    currentViewers: number;
    announcementMessageId: string | null;
    lastChecked: Date;
  }) {
    return db.insert(streamers).values(data).returning().get();
  },

  async updateStreamer(discordUserId: string, data: Partial<{
    discordUsername: string;
    twitchUsername: string | null;
    isLive: boolean;
    currentStreamTitle: string | null;
    currentViewers: number;
    announcementMessageId: string | null;
    lastChecked: Date;
  }>) {
    return db.update(streamers).set(data).where(eq(streamers.discordUserId, discordUserId)).returning().get();
  },

  // --- Bot Settings ---
  async getBotSettings() {
    return db.select().from(botSettings).get();
  },

  async updateBotSettings(data: Partial<{
    watchedRoleId: string;
    liveRoleId: string;
    announceChannelId: string;
    checkIntervalSeconds: number;
    isActive: boolean;
  }>) {
    return db.update(botSettings).set(data).returning().get();
  },

  // --- Activities ---
  async createActivity(data: {
    type: string;
    streamerDiscordId: string;
    streamerUsername: string;
    description: string;
    timestamp?: Date;
  }) {
    return db.insert(activities).values({
      ...data,
      timestamp: data.timestamp || new Date(),
    }).returning().get();
  },
};
