import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Konfigurasi koneksi dengan parameter timezone
const connectionString = process.env.DATABASE_URL!;

// Fungsi untuk mengatur koneksi
async function setupConnection() {
  // Set timezone untuk koneksi saat ini menggunakan SQL
  const sql = postgres(connectionString, {
    prepare: false, // Disable prepared statements for better compatibility
    ssl: 'prefer', // Use SSL if available
    connect_timeout: 10, // 10 second timeout
    idle_timeout: 20, // Idle connection timeout
    max_lifetime: 60 * 30, // Connection max lifetime
  });
  
  try {
    // Jalankan query SET timezone secara manual sebelum operasi apapun
    await sql`SET timezone = 'Asia/Jakarta'`;
    console.log("[DB] Timezone database diatur ke Asia/Jakarta (WIB)");
  } catch (error) {
    console.error("[DB] Error saat mengatur timezone:", error);
  }
  
  return sql;
}

// Buat dan inisialisasi client
const client = postgres(connectionString, {
  prepare: false,
  ssl: 'prefer',
});

// Buat instance drizzle
export const db = drizzle({ client });

// Memastikan timezone database di-set ke WIB
export async function ensureWIBTimezone() {
  try {
    // Set timezone untuk koneksi saat ini
    await db.execute(`SET timezone = 'Asia/Jakarta'`);
    const result = await db.execute(`SHOW timezone`);
    console.log(`[DB] Timezone database: ${JSON.stringify(result)}`);
    return true;
  } catch (error) {
    console.error("[DB] Error saat mengatur timezone:", error);
    return false;
  }
}
