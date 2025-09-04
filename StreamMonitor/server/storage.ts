import { db } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { users, streamers, bot_settings, activities } from './schema.js';
import { eq } from 'drizzle-orm';

export const storage = {
  // Users
  getUser: async (id: string) => {
    const result = await db.select().from(users).where(eq(users.id, id)).execute();
    return result[0] ?? null;
  },

  createUser: async (username: string, password: string) => {
    const id = uuidv4();
    await db.insert(users).values({ id, username, password }).execute();
    return { id, username };
  },

  // Streamers
  getStreamer: async (discordUserId: string) => {
    const result = await db.select().from(streamers).where(eq(streamers.discordUserId, discordUserId)).execute();
    return result[0] ?? null;
  },

  getAllStreamers: async () => {
    return await db.select().from(streamers).execute();
  },

  createStreamer: async (data: any) => {
    const id = uuidv4();
    const newStreamer = { ...data, id, lastChecked: new Date() };
    await db.insert(streamers).values(newStreamer).execute();
    return newStreamer;
  },

  updateStreamer: async (discordUserId: string, data: Partial<any>) => {
    await db.update(streamers).set({ ...data, lastChecked: new Date() }).where(eq(streamers.discordUserId, discordUserId)).execute();
    return await storage.getStreamer(discordUserId);
  },

  // Bot settings
  getBotSettings: async () => {
    const result = await db.select().from(bot_settings).execute();
    return result[0] ?? null;
  },

  updateBotSettings: async (data: Partial<any>) => {
    await db.update(bot_settings).set(data).execute();
    return await storage.getBotSettings();
  },

  // Activities
  createActivity: async (data: any) => {
    const id = uuidv4();
    const newActivity = { ...data, id, timestamp: new Date() };
    await db.insert(activities).values(newActivity).execute();
    return newActivity;
  },
};
