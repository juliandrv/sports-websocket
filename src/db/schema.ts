import { pgTable, pgEnum, serial, text, integer, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Match status enum with scheduled, live, and finished values
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);

// Matches table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('end_time_after_start', sql`end_time IS NULL OR end_time > start_time`),
  check('non_negative_home_score', sql`home_score >= 0`),
  check('non_negative_away_score', sql`away_score >= 0`),
]);

// Commentary table
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .references(() => matches.id, { onDelete: 'cascade' })
    .notNull(),
  minute: integer('minute'),
  sequence: integer('sequence').notNull(),
  period: text('period'),
  eventType: text('event_type').notNull(),
  actor: text('actor'),
  team: text('team'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('commentary_match_id_idx').on(table.matchId),
]);
