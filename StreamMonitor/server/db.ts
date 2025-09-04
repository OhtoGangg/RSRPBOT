import { User, Streamer, BotSettings, Activity } from "../shared/schema";
import { createClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

// Ensure Node types are available
// Make sure your tsconfig.json has "types": ["node"]
// and you've installed @types/node

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

// Create database client
const client = createClient(process.env.DATABASE_URL);

// Initialize drizzle ORM
export const db = drizzle(client);
