import { pgTable, varchar, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

// Define your tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username"),
  password: varchar("password"),
});

export const streamers = pgTable("streamers", {
  id: varchar("id").primaryKey(),
  discordUserId: varchar("discord_user_id"),
  discordUsername: varchar("discord_username"),
  twitchUsername: varchar("twitch_username"),
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

// Export types for each table
export type User = InferModel<typeof users>;
export type Streamer = InferModel<typeof streamers>;
export type BotSetting = InferModel<typeof botSettings>;
export type Activity = InferModel<typeof activities>;
