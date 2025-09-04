import { pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: varchar('id').primaryKey(),
  username: varchar('username').notNull(),
  password: varchar('password').notNull(),
});

export const streamersTable = pgTable('streamers', {
  id: varchar('id').primaryKey(),
  discordUserId: varchar('discordUserId').notNull(),
  discordUsername: varchar('discordUsername').notNull(),
  twitchUsername: varchar('twitchUsername').notNull(),
  isLive: boolean('isLive').notNull(),
  currentStreamTitle: varchar('currentStreamTitle'),
  currentViewers: varchar('currentViewers').notNull(),
  announcementMessageId: varchar('announcementMessageId'),
  lastChecked: timestamp('lastChecked').notNull(),
});

export const botSettingsTable = pgTable('bot_settings', {
  id: varchar('id').primaryKey(),
  isActive: boolean('isActive').notNull(),
  checkIntervalSeconds: varchar('checkIntervalSeconds').notNull(),
});

export const activitiesTable = pgTable('activities', {
  id: varchar('id').primaryKey(),
  timestamp: timestamp('timestamp').notNull(),
  description: varchar('description').notNull(),
});
