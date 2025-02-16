import { pgTable, text, bigint, jsonb } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  role: text('role').notNull(),
  metadata: jsonb('metadata').notNull(),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  files: jsonb('files').notNull(),
});
