import { createClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const client = createClient({
  url: process.env.DATABASE_URL,
});

export const db = drizzle(client);
