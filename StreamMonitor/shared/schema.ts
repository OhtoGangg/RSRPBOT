import { pgTable, varchar, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

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

// Types
export type User = InferModel<typeof users>;
export type InsertUser = InferModel<typeof users, "insert">;

export type Streamer = InferModel<typeof streamers>;
export type InsertStreamer = InferModel<typeof streamers, "insert">;

export type BotSettings = InferModel<typeof botSettings>;
export type InsertBotSettings = InferModel<typeof botSettings, "insert">;

export type Activity = InferModel<typeof activities>;
export type InsertActivity = InferModel<typeof activities, "insert">;
