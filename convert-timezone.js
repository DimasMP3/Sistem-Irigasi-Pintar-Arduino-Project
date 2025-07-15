#!/usr/bin/env node

import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';
import { fixDatabaseTimezone } from './src/lib/timezone-fix.js';

async function main() {
  console.log("🔄 Script Konversi Timezone Database");
  console.log("===================================");
  
  try {
    // Set timezone ke WIB
    await fixDatabaseTimezone();
    
    // Konversi data yang ada ke WIB
    console.log("🕒 Mengkonversi data waktu yang ada ke WIB...");
    
    // Gunakan query SQL untuk mengkonversi timezone
    const result = await db.execute(sql`
      UPDATE "kelembapan_tanah"
      SET "waktu" = "waktu" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
    `);
    
    console.log("✅ Konversi data selesai!");
    console.log(`📊 Jumlah baris yang diupdate: ${result.rowCount || 'tidak diketahui'}`);
    
    // Periksa beberapa data setelah konversi
    console.log("🔍 Memeriksa beberapa data setelah konversi...");
    
    const samples = await db.execute(sql`
      SELECT * FROM "kelembapan_tanah" 
      ORDER BY "id" DESC 
      LIMIT 5
    `);
    
    console.log("📋 Sample data:");
    console.table(samples.rows);
    
    console.log("\n🎉 Konversi timezone berhasil! Semua data waktu sekarang menggunakan WIB.");
    
  } catch (error) {
    console.error("❌ Terjadi error saat konversi:", error);
    process.exit(1);
  }
}

main(); 