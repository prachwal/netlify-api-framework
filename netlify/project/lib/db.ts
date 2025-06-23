import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

// Schema definitions (copy from src/lib/schema.ts)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const counterSessions = pgTable('counter_sessions', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().unique(),
  count: text('count').default('0').notNull(),
  isEven: text('is_even').default('true').notNull(),
  doubleCount: text('double_count').default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Get the connection string from environment variables
const connectionString = process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
    throw new Error('NETLIFY_DATABASE_URL environment variable is required');
}

export const db = drizzle(neon(connectionString), {
    schema: { users, counterSessions }
});
