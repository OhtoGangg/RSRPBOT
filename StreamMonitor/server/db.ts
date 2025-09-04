import { drizzle } from 'drizzle-orm/neon-serverless';
import { NeonDatabase } from '@neondatabase/serverless';

const client = new NeonDatabase({
  url: process.env.DATABASE_URL || '',
});

export const db = drizzle(client);
