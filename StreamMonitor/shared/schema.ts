import { pgTable, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  username: varchar('username').notNull(),
  password: varchar('password').notNull(),
});

export const streamers = pgTable('streamers', {
  id: varchar('id').primaryKey(),
  discordUserId: varchar('discord_user_id').notNull(),
  discordUsername: varchar('discord_username').notNull(),
  twitchUsername: varchar('twitch_username'),
  isLive: boolean('is_live').notNull().default(false),
  currentStreamTitle: varchar('current_stream_title'),
  currentViewers: integer('current_viewers').notNull().default(0),
  announcementMessageId: varchar('announcement_message_id'),
  lastChecked: timestamp('last_checked').notNull().defaultNow(),
});

export const bot_settings = pgTable('bot_settings', {
  id: varchar('id').primaryKey(),
  watchedRoleId: varchar('watched_role_id'),
  liveRoleId: varchar('live_role_id'),
  announceChannelId: varchar('announce_channel_id'),
  checkIntervalSeconds: integer('check_interval_seconds'),
  isActive: boolean('is_active').notNull().default(false),
});

export const activities = pgTable('activities', {
  id: varchar('id').primaryKey(),
  type: varchar('type').notNull(),
  streamerDiscordId: varchar('streamer_discord_id').notNull(),
  streamerUsername: varchar('streamer_username').notNull(),
  description: varchar('description').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});
