#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL tidak ditemukan! Pastikan variabel lingkungan tersedia.');
  process.exit(1);
}

async function main() {
  console.log("🔄 Script Konversi Timezone Database");
  console.log("===================================");
  
  try {
    // Connect to the database
    console.log("🔌 Menghubungkan ke database...");
    const sql = postgres(DATABASE_URL, { ssl: 'prefer' });
    
    // Set timezone to WIB
    console.log("🕒 Mengatur timezone database ke WIB...");
    await sql`SET timezone = 'Asia/Jakarta'`;
    
    // Verify timezone
    const tzResult = await sql`SHOW timezone`;
    console.log(`🌐 Timezone database sekarang: ${tzResult[0].timezone}`);
    
    // Convert existing data
    console.log("🔄 Mengkonversi data ke WIB...");
    const updateResult = await sql`
      UPDATE kelembapan_tanah
      SET waktu = waktu AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
    `;
    
    console.log("✅ Konversi data selesai!");
    
    // Sample data after conversion
    console.log("🔍 Memeriksa beberapa data setelah konversi...");
    const samples = await sql`
      SELECT id, nilai, persen, mode, 
        to_char(waktu, 'YYYY-MM-DD HH24:MI:SS TZ') as waktu_format
      FROM kelembapan_tanah
      ORDER BY id DESC
      LIMIT 5
    `;
    
    console.log("📋 Sample data:");
    samples.forEach(row => {
      console.log(`ID: ${row.id}, Waktu: ${row.waktu_format}, Persen: ${row.persen}%`);
    });
    
    console.log("\n🎉 Konversi timezone berhasil! Semua data waktu sekarang menggunakan WIB.");
    
    // Close the connection
    await sql.end();
    console.log("👋 Koneksi database ditutup.");
    
  } catch (error) {
    console.error("❌ Error saat mengkonversi timezone:", error);
    process.exit(1);
  }
}

main(); 