// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Taulut ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const streamers = pgTable("streamers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
  twitchUsername: text("twitch_username").default(''),
  isLive: boolean("is_live").default(false),
  currentStreamTitle: text("current_stream_title").default(''),
  currentViewers: integer("current_viewers").default(0),
  lastChecked: timestamp("last_checked").default(sql`now()`),
  announcementMessageId: text("announcement_message_id").default(''),
});

export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  watchedRoleId: text("watched_role_id").notNull(),
  liveRoleId: text("live_role_id").notNull(),
  announceChannelId: text("announce_channel_id").notNull(),
  checkIntervalSeconds: integer("check_interval_seconds").default(60),
  isActive: boolean("is_active").default(true),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "stream_start", "stream_end", "role_added", "role_removed", "announcement"
  streamerDiscordId: text("streamer_discord_id").notNull(),
  streamerUsername: text("streamer_username").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

// --- Insert skeemat Zodilla ---
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStreamerSchema = createInsertSchema(streamers).omit({
  id: true,
  lastChecked: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

// --- TypeScript tyypit ---
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Streamer = typeof streamers.$inferSelect;
export type InsertStreamer = z.infer<typeof insertStreamerSchema>;

export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
