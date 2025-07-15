-- Set database timezone ke Asia/Jakarta (WIB)
SET timezone = 'Asia/Jakarta';

-- Update kolom waktu untuk menggunakan timezone Asia/Jakarta secara default
ALTER TABLE "kelembapan_tanah" 
  ALTER COLUMN "waktu" SET DEFAULT (now() AT TIME ZONE 'Asia/Jakarta');

-- Konversi data yang sudah ada ke timezone WIB
UPDATE "kelembapan_tanah"
SET "waktu" = "waktu" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta';

-- Set parameter timezone untuk sesi
ALTER DATABASE CURRENT SET timezone TO 'Asia/Jakarta'; 