import { createClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const client = createClient({ url: process.env.DATABASE_URL! });
export const db = drizzle(client);
