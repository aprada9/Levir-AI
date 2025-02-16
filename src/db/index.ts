import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

// Using the connection pooling URL
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { 
  ssl: 'require',  // Required for Supabase
  prepare: false,  // Disable prepare statements for connection pooling
  max: 1          // Set to 1 for connection pooling
});

export const db = drizzle(client, { schema });

export default db;
