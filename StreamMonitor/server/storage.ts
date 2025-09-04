// server/storage.ts
import { db } from "./db.js";
import { users, streamers, botSettings, activities } from "../shared/schema.js";
import { eq } from "drizzle-orm";

export const storage = {
  users: {
    getById: async (id: string) => {
      return await db.select().from(users).where(eq(users.id, id)).get();
    },
    create: async (data: { username: string; password: string }) => {
      return await db.insert(users).values(data).get();
    },
  },
  streamers: {
    getAll: async () => {
      return await db.select().from(streamers).all();
    },
    getByDiscordId: async (discordUserId: string) => {
      return await db.select().from(streamers).where(eq(streamers.discordUserId, discordUserId)).get();
    },
    create: async (data: any) => {
      return await db.insert(streamers).values(data).get();
    },
    update: async (discordUserId: string, data: any) => {
      return await db.update(streamers).set(data).where(eq(streamers.discordUserId, discordUserId)).get();
    },
  },
  botSettings: {
    get: async () => {
      return await db.select().from(botSettings).get();
    },
    update: async (data: any) => {
      return await db.update(botSettings).set(data).get();
    },
  },
  activities: {
    create: async (data: any) => {
      return await db.insert(activities).values(data).get();
    },
  },
};
