import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sql } from 'drizzle-orm';

/**
 * API untuk menginisialisasi timezone database
 * Akan menjalankan query untuk mengatur timezone ke WIB (Asia/Jakarta)
 * Endpoint: /api/init-db-timezone
 */
export async function GET() {
  try {
    // Set timezone ke Asia/Jakarta
    await db.execute(sql`SET timezone = 'Asia/Jakarta'`);
    
    // Verifikasi timezone sudah berubah
    const tzResult = await db.execute(sql`SHOW timezone`);
    
    // Konversi data yang ada (opsional, bisa jadi operasi berat)
    await db.execute(sql`
      UPDATE kelembapan_tanah
      SET waktu = waktu AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
      WHERE waktu IS NOT NULL
    `);
    
    // Buat trigger untuk penanganan timezone otomatis (jika belum ada)
    try {
      await db.execute(sql`
        CREATE OR REPLACE FUNCTION insert_timestamp_wib()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.waktu IS NULL THEN
            NEW.waktu = (now() AT TIME ZONE 'Asia/Jakarta');
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      await db.execute(sql`
        DROP TRIGGER IF EXISTS set_timestamp_wib ON kelembapan_tanah;
        CREATE TRIGGER set_timestamp_wib
        BEFORE INSERT ON kelembapan_tanah
        FOR EACH ROW
        EXECUTE FUNCTION insert_timestamp_wib();
      `);
    } catch (triggerError) {
      console.error("Error saat membuat trigger:", triggerError);
      // Tidak perlu menghentikan eksekusi jika gagal membuat trigger
    }
    
    // Contoh data setelah konversi
    const samples = await db.execute(sql`
      SELECT id, nilai, persen, mode, 
        to_char(waktu, 'YYYY-MM-DD HH24:MI:SS TZ') as waktu_format
      FROM kelembapan_tanah
      ORDER BY id DESC
      LIMIT 5
    `);
    
    return NextResponse.json({ 
      success: true, 
      timezone: tzResult[0]?.timezone || 'unknown',
      samples: samples
    });
  } catch (error) {
    console.error("Error initializing timezone:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
} 