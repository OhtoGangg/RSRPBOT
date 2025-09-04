// server/storage.ts
import { db } from './db.js';
import { streamers, bot_settings, activities, users } from './schema.js';
import { eq } from 'drizzle-orm';

// --- Users ---
export async function getUserByUsername(username: string) {
  return db.select().from(users).where(eq(users.username, username)).get();
}

export async function createUser(data: { username: string; password: string }) {
  return db.insert(users).values(data).returning();
}

// --- Streamers ---
export async function getStreamer(discordUserId: string) {
  return db.select().from(streamers).where(eq(streamers.discordUserId, discordUserId)).get();
}

export async function getAllStreamers() {
  return db.select().from(streamers).all();
}

export async function createStreamer(data: {
  discordUserId: string;
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean;
  currentStreamTitle: string | null;
  currentViewers: number;
  announcementMessageId: string | null;
}) {
  return db.insert(streamers).values(data).returning();
}

export async function updateStreamer(discordUserId: string, data: Partial<{
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean;
  currentStreamTitle: string | null;
  currentViewers: number;
  announcementMessageId: string | null;
}>) {
  return db.update(streamers).set(data).where(eq(streamers.discordUserId, discordUserId));
}

// --- Bot Settings ---
export async function getBotSettings() {
  return db.select().from(bot_settings).get();
}

export async function updateBotSettings(data: Partial<{
  watchedRoleId: string;
  liveRoleId: string;
  announceChannelId: string;
  checkIntervalSeconds: number;
  isActive: boolean;
}>) {
  return db.update(bot_settings).set(data);
}

// --- Activities ---
export async function createActivity(data: {
  type: string;
  streamerDiscordId: string;
  streamerUsername: string;
  description: string;
}) {
  return db.insert(activities).values(data);
}
