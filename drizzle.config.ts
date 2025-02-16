import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT),
    ssl: {
      ca: process.env.DATABASE_CA?.replace(/\\n/g, "\n"),
      rejectUnauthorized: false
    }
  },
  // Supabase specific configurations
  entities: {
    roles: {
      provider: 'supabase'  // This tells Drizzle to handle Supabase roles correctly
    }
  },
  // Optional but recommended settings
  verbose: true,  // Print all SQL statements
  strict: true,   // Prompt for confirmation before running SQL
  schemaFilter: ['public'],  // Only manage tables in the public schema
  breakpoints: true  // Add SQL statement breakpoints
})


