// shared/schema.ts
import { pgTable, serial, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

// Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username"),
  password: varchar("password"),
});

export const streamers = pgTable("streamers", {
  id: varchar("id").primaryKey(),
  discordUserId: varchar("discord_user_id"),
  discordUsername: varchar("discord_username"),
  twitchUsername: varchar("twitch_username").nullable(),
  isLive: boolean("is_live"),
  currentStreamTitle: text("current_stream_title").nullable(),
  currentViewers: text("current_viewers"),
  announcementMessageId: varchar("announcement_message_id").nullable(),
});

export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey(),
  isActive: boolean("is_active"),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey(),
  streamerId: varchar("streamer_id"),
  type: varchar("type"),
  timestamp: timestamp("timestamp"),
});

// TypeScript interfaces for storage
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

export interface Streamer {
  id: string;
  discordUserId: string;
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean;
  currentStreamTitle: string | null;
  currentViewers: number;
  announcementMessageId: string | null;
  lastChecked: Date;
}

export interface InsertStreamer {
  discordUserId: string;
  discordUsername: string;
  twitchUsername?: string | null;
  isLive?: boolean;
  currentStreamTitle?: string | null;
  currentViewers?: number;
  announcementMessageId?: string | null;
}

export interface BotSettings {
  id: string;
  isActive: boolean;
  watchedRoleId?: string;
  liveRoleId?: string;
  announceChannelId?: string;
  checkIntervalSeconds?: number;
}

export interface InsertBotSettings {
  isActive?: boolean;
  watchedRoleId?: string;
  liveRoleId?: string;
  announceChannelId?: string;
  checkIntervalSeconds?: number;
}

export interface Activity {
  id: string;
  streamerId: string;
  type: string;
  timestamp: Date;
}

export interface InsertActivity {
  streamerId: string;
  type: string;
  timestamp?: Date;
}
