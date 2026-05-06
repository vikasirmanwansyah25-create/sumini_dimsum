-- ========================================
-- FIX: Tambah kolom harga_beli ke tabel CartItem
-- Jalankan SQL ini di Supabase SQL Editor
-- ========================================

-- 1. Tambah kolom harga_beli ke tabel CartItem
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "harga_beli" INTEGER DEFAULT 0;

-- 2. Update data lama CartItem dengan harga_beli dari tabel Menu (jika ada data lama)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "CartItem" LIMIT 1) THEN
    UPDATE "CartItem" 
    SET "harga_beli" = (
      SELECT COALESCE(m."harga_beli", 0)
      FROM "Menu" m 
      WHERE m."id" = "CartItem"."menuId"
    )
    WHERE "harga_beli" IS NULL OR "harga_beli" = 0;
  END IF;
END
$$;

-- 3. Refresh cache skema Supabase agar perubahan dikenali
NOTIFY pgrst, 'reload schema';

-- 4. Verifikasi kolom sudah ditambahkan
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'CartItem' 
  AND column_name = 'harga_beli';

-- Selesai! Seharusnya checkout sudah bisa berjalan normal.
