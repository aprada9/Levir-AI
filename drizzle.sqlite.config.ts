import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/sqlite-schema.ts',
  dialect: 'sqlite',
  out: './drizzle',
  dbCredentials: {
    url: './data/db.sqlite'
  }
} satisfies Config;