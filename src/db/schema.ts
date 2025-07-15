import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const kelembapan_tanah = pgTable('kelembapan_tanah', {
  id: serial('id').primaryKey(),
  nilai: integer('nilai').notNull(),
  persen: integer('persen').notNull(),
  mode: text('mode').notNull(),
  // Gunakan timestamp dengan timezone dan set default ke now() dengan timezone WIB
  waktu: timestamp('waktu', { mode: 'date', precision: 6, withTimezone: true })
    .default(sql`(now() AT TIME ZONE 'Asia/Jakarta')`),
});
