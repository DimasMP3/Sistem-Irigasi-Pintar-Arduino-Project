
// Impor library MQTT
import mqtt from 'mqtt';

// --- PERBAIKAN PATH IMPORT ---
// Impor langsung dari file TypeScript (.ts) yang ada di proyek Anda.
// Pastikan path ini benar relatif dari root folder.
import { db, ensureWIBTimezone } from './src/db/index.js';
import { kelembapan_tanah } from './src/db/schema.js';
import { formatToWIB, getWIBTimestamp } from './src/lib/timezone-fix.js';
import { sql } from 'drizzle-orm';

// --- TOPIK MQTT ---
const TOPIC_DATA = 'sensor/tanah/data';
const TOPIC_KONTROL = 'kontrol/pompa';

let currentMode = 'otomatis';

// --- PENGATURAN THROTTLING ---
let lastInsertTime = 0; 
const INSERT_INTERVAL_MS = 15000; // Simpan data setiap 15 detik

// Pastikan database menggunakan timezone yang benar sebelum mulai
async function initializeWorker() {
  try {
    console.log("Menginisialisasi worker dengan timezone WIB...");
    
    // Set timezone database ke WIB
    const tzResult = await ensureWIBTimezone();
    if (tzResult) {
      console.log("✅ Database timezone berhasil diatur ke WIB");
    } else {
      console.warn("⚠️ Gagal mengatur timezone database secara otomatis");
    }
    
    startMQTTClient();
  } catch (error) {
    console.error("Error saat inisialisasi worker:", error);
    process.exit(1);
  }
}

function startMQTTClient() {
  console.log('Mencoba terhubung ke MQTT Broker...');

  // Perbaikan: Gunakan format URL langsung dan opsi yang lebih sederhana
  const client = mqtt.connect('', {
    clientId: `worker-server-${Math.random().toString(16).slice(2, 8)}`,
    username: '',
    password: '',
    rejectUnauthorized: false, // Nonaktifkan verifikasi sertifikat untuk mengatasi masalah TLS
    reconnectPeriod: 5000
  });

  client.on('connect', () => {
    console.log(`[OK] Terhubung ke MQTT Broker`);
    console.log(`[INFO] Data akan disimpan ke database setiap ${INSERT_INTERVAL_MS / 1000 / 60} menit.`);
    console.log(`[TIME] Menggunakan waktu Indonesia Barat (WIB/GMT+7)`);

    client.subscribe(TOPIC_DATA, (err) => {
      if (!err) console.log(`[OK] Berhasil subscribe ke topik data: "${TOPIC_DATA}"`);
      else console.error(`[FAIL] Gagal subscribe ke topik data: ${err}`);
    });

    client.subscribe(TOPIC_KONTROL, (err) => {
      if (!err) console.log(`[OK] Berhasil subscribe ke topik kontrol: "${TOPIC_KONTROL}"`);
      else console.error(`[FAIL] Gagal subscribe ke topik kontrol: ${err}`);
    });
  });

  client.on('message', async (topic, payload) => {
    const message = payload.toString(); 
    console.log(`[->] Pesan diterima | Topik: ${topic} | Pesan: ${message}`);

    if (topic === TOPIC_KONTROL) {
      if (message === 'AUTO') currentMode = 'otomatis';
      else if (message === 'MANUAL_ON' || message === 'MANUAL_OFF') currentMode = 'manual';
      console.log(`[MODE] Mode diubah menjadi: ${currentMode}`);
      return; 
    }

    if (topic === TOPIC_DATA) {
      const currentTime = Date.now();
      try {
        const data = JSON.parse(message);
        const persen = data.persen;

        if (typeof persen !== 'number') {
          console.error('[DB] Data persen tidak valid:', persen);
          return;
        }

        if (currentTime - lastInsertTime >= INSERT_INTERVAL_MS || persen <= 40) {
          lastInsertTime = currentTime;
          console.log(`[SAVE] Menyimpan data ke database... ${persen <= 40 ? '(Kelembapan rendah: ' + persen + '%)' : ''}`);

          const soilDry = 950;
          const soilWet = 350;
          const nilai = Math.round(soilWet + (soilDry - soilWet) * (100 - persen) / 100);
          
          // Dapatkan waktu WIB menggunakan utility function
          const wibDateTime = getWIBTimestamp();
          console.log(`[TIME] Waktu penyimpanan: ${formatToWIB(wibDateTime)}`);

          // Set timezone session ke WIB untuk memastikan data disimpan dengan benar
          await ensureWIBTimezone();
          
          // Tambahkan mekanisme retry dengan operator OR
          try {
            await db.insert(kelembapan_tanah).values({
              nilai: nilai,
              persen: persen,
              mode: currentMode,
              waktu: wibDateTime, // Waktu dengan timezone WIB explicit
            });
            console.log('[DB] Data berhasil disimpan ke database!');
          } catch (dbError) {
            console.error('[DB] Percobaan pertama gagal, mencoba lagi:', dbError);
            
            // Tunggu sebentar sebelum mencoba lagi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              await db.insert(kelembapan_tanah).values({
                nilai: nilai,
                persen: persen,
                mode: currentMode,
                waktu: getWIBTimestamp(), // Generate waktu WIB baru
              }) || console.error('[DB] Percobaan kedua gagal juga.');
              console.log('[DB] Data berhasil disimpan ke database pada percobaan kedua!');
            } catch (retryError) {
              console.error('[DB] Gagal menyimpan data setelah percobaan ulang:', retryError);
            }
          }
        } else {
          console.log(`[SKIP] Belum waktunya menyimpan. Data akan diabaikan.`);
        }
      } catch (error) {
        console.error('[ERROR] Gagal memproses pesan atau menyimpan ke database:', error);
      }
    }
  });

  client.on('error', (err) => {
    console.error('[ERROR] Terjadi error pada koneksi MQTT:', err);
    client.end();
  });

  process.on('SIGINT', () => {
    console.log('\n[EXIT] Menutup koneksi MQTT...');
    client.end();
    process.exit();
  });
}

// Jalankan worker dengan timezone WIB
initializeWorker();