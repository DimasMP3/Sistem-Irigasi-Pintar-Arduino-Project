import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const kelembapan_tanah = pgTable('kelembapan_tanah', {
  id: serial('id').primaryKey(),
  nilai: integer('nilai').notNull(),
  persen: integer('persen').notNull(),
  mode: text('mode').notNull(),
  waktu: timestamp('waktu', { withTimezone: true }).defaultNow(),
});
