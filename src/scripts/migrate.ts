import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import * as sqliteSchema from '../db/sqlite-schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  // Source SQLite database
  const sqlite = new Database('data/db.sqlite');
  const sourceDb = drizzle(sqlite, { schema: sqliteSchema });

  // Target Supabase database
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all data from SQLite
  const chats = await sourceDb.query.chats.findMany();
  const messages = await sourceDb.query.messages.findMany();

  // Transform data to match PostgreSQL schema
  const transformedMessages = messages.map(msg => ({
    ...msg,
    role: msg.type,
    metadata: msg.metadata ? JSON.parse(msg.metadata as string) : null
  }));

  // Insert data into Supabase
  for (const chat of chats) {
    await supabase.from('chats').insert(chat);
  }

  for (const message of transformedMessages) {
    await supabase.from('messages').insert(message);
  }

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(console.error); 