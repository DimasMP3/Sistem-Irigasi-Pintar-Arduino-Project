import { db } from '../db/index';
import { sql } from 'drizzle-orm';

/**
 * Fungsi untuk memastikan timezone database di-set ke WIB (Asia/Jakarta)
 * Dapat dijalankan di awal aplikasi atau sebagai script terpisah
 */
export async function fixDatabaseTimezone() {
  try {
    console.log("🕒 Menerapkan timezone WIB ke database...");
    
    // Set timezone database ke Asia/Jakarta
    await db.execute(sql`SET timezone = 'Asia/Jakarta'`);
    console.log("✅ Timezone database berhasil diatur ke Asia/Jakarta");
    
    // Set timezone untuk sesi saat ini
    await db.execute(sql`ALTER DATABASE CURRENT SET timezone TO 'Asia/Jakarta'`);
    console.log("✅ Timezone database default berhasil diatur ke Asia/Jakarta");
    
    // Cek timezone yang digunakan saat ini
    const result = await db.execute(sql`SHOW timezone`);
    console.log(`🌐 Timezone database saat ini: ${JSON.stringify(result)}`);
    
    return { success: true };
  } catch (error) {
    console.error("❌ Gagal menerapkan timezone WIB ke database:", error);
    return { success: false, error };
  }
}

/**
 * Memformat waktu UTC ke WIB untuk ditampilkan
 */
export function formatToWIB(date: Date): string {
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' WIB';
}

/**
 * Membuat timestamp dengan timezone WIB yang eksplisit
 */
export function getWIBTimestamp(): Date {
  const now = new Date();
  const utcDate = new Date(now.toUTCString());
  // Menambahkan offset +7 jam untuk WIB
  utcDate.setHours(utcDate.getHours() + 7);
  return utcDate;
} 