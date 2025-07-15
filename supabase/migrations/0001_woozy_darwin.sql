ALTER TABLE "kelembapan_tanah" ALTER COLUMN "waktu" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "kelembapan_tanah" ALTER COLUMN "waktu" SET DEFAULT now();--> statement-breakpoint
-- Set default timezone to Asia/Jakarta (WIB)
ALTER DATABASE CURRENT SET timezone TO 'Asia/Jakarta';