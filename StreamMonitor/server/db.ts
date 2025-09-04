import { User, Streamer, BotSettings, Activity } from "../shared/schema";
import { createClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const client = createClient(databaseUrl);

export const db = drizzle(client);
