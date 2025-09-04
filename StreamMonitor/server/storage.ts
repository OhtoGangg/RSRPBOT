import { eq } from 'drizzle-orm';
import { db } from './db';
import { usersTable, streamersTable, botSettingsTable, activitiesTable } from './schema';

export const storage = {
  users: {
    getById: async (id: string) => db.select().from(usersTable).where(eq(usersTable.id, id)).get(),
    create: async (data: { username: string; password: string }) => db.insert(usersTable).values(data).returning().get(),
  },
  streamers: {
    getAll: async () => db.select().from(streamersTable).all(),
    getByDiscordId: async (discordUserId: string) => db.select().from(streamersTable).where(eq(streamersTable.discordUserId, discordUserId)).get(),
    create: async (data: any) => db.insert(streamersTable).values(data).returning().get(),
    update: async (discordUserId: string, data: any) => db.update(streamersTable).set(data).where(eq(streamersTable.discordUserId, discordUserId)).returning().get(),
  },
  botSettings: {
    get: async () => db.select().from(botSettingsTable).get(),
    update: async (id: string, data: any) => db.update(botSettingsTable).set(data).where(eq(botSettingsTable.id, id)).returning().get(),
  },
  activities: {
    create: async (data: any) => db.insert(activitiesTable).values(data).returning().get(),
  },
};
