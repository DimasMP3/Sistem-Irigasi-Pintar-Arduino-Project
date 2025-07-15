#!/usr/bin/env node

import { fixDatabaseTimezone } from './src/lib/timezone-fix.js';

async function main() {
  console.log("🔧 Script Perbaikan Timezone Database");
  console.log("====================================");
  
  try {
    const result = await fixDatabaseTimezone();
    
    if (result.success) {
      console.log("🎉 Berhasil menerapkan timezone WIB ke database!");
      console.log("📝 Catatan: Semua timestamp sekarang akan disimpan dalam format WIB.");
    } else {
      console.error("❌ Gagal menerapkan timezone WIB:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Terjadi error saat menjalankan script:", error);
    process.exit(1);
  }
}

main(); 