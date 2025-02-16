import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'perplexica',
    port: 5432
  },
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
  breakpoints: true
}); 