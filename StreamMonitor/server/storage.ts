import { db } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { users, streamers, bot_settings, activities } from './schema.js';
import { eq } from 'drizzle-orm';

export const storage = {
  // Users
  getUser: async (id: string) => {
    return await db.select().from(users).where(eq(users.id, id)).get();
  },

  createUser: async (username: string, password: string) => {
    const id = uuidv4();
    await db.insert(users).values({ id, username, password });
    return { id, username };
  },

  // Streamers
  getStreamer: async (discordUserId: string) => {
    return await db.select().from(streamers).where(eq(streamers.discordUserId, discordUserId)).get();
  },

  getAllStreamers: async () => {
    return await db.select().from(streamers).all();
  },

  createStreamer: async (data: any) => {
    const id = uuidv4();
    await db.insert(streamers).values({ ...data, id, lastChecked: new Date() });
    return { ...data, id, lastChecked: new Date() };
  },

  updateStreamer: async (discordUserId: string, data: Partial<any>) => {
    await db.update(streamers).set({ ...data, lastChecked: new Date() }).where(eq(streamers.discordUserId, discordUserId));
    return await db.select().from(streamers).where(eq(streamers.discordUserId, discordUserId)).get();
  },

  // Bot settings
  getBotSettings: async () => {
    return await db.select().from(bot_settings).get();
  },

  updateBotSettings: async (data: Partial<any>) => {
    await db.update(bot_settings).set(data);
    return await db.select().from(bot_settings).get();
  },

  // Activities
  createActivity: async (data: any) => {
    const id = uuidv4();
    await db.insert(activities).values({ ...data, id, timestamp: new Date() });
    return { ...data, id, timestamp: new Date() };
  },
};
