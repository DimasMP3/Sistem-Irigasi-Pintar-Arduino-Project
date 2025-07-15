-- Aktifkan timezone Asia/Jakarta (WIB)
SET timezone = 'Asia/Jakarta';

-- Fungsi untuk menyimpan waktu dengan timezone WIB
CREATE OR REPLACE FUNCTION insert_timestamp_wib()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika kolom waktu tidak diisi, set ke now() dengan timezone WIB
    IF NEW.waktu IS NULL THEN
        NEW.waktu = (now() AT TIME ZONE 'Asia/Jakarta');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat trigger untuk tabel kelembapan_tanah
DROP TRIGGER IF EXISTS set_timestamp_wib ON kelembapan_tanah;
CREATE TRIGGER set_timestamp_wib
BEFORE INSERT ON kelembapan_tanah
FOR EACH ROW
EXECUTE FUNCTION insert_timestamp_wib();

-- Update semua data yang ada ke timezone WIB
UPDATE kelembapan_tanah
SET waktu = waktu AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
WHERE waktu IS NOT NULL; 