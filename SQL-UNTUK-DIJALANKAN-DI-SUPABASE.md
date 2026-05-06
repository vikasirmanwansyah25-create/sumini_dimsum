# CARA MEMPERBAIKI ERROR CARTITEM HARGA_BELI

## Error:
`Gagal menyimpan transaksi: Could not find the 'harga_beli' column of 'CartItem' in the schema cache`

## Solusi:
Jalankan SQL berikut di **Supabase Dashboard > SQL Editor**

---

### SQL yang harus dijalankan:

```sql
-- 1. Tambah kolom harga_beli ke tabel CartItem
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "harga_beli" INTEGER DEFAULT 0;

-- 2. Update data lama dengan harga_beli dari tabel Menu
UPDATE "CartItem" 
SET "harga_beli" = (
  SELECT COALESCE(m."harga_beli", 0)
  FROM "Menu" m 
  WHERE m."id" = "CartItem"."menuId"
)
WHERE "harga_beli" IS NULL OR "harga_beli" = 0;

-- 3. Refresh cache skema Supabase
NOTIFY pgrst, 'reload schema';

-- 4. Verifikasi (lihat hasilnya di bawah)
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'CartItem' 
  AND column_name = 'harga_beli';
```

---

## Langkah-langkah:

1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri
4. Copy seluruh SQL di atas
5. Paste ke SQL Editor
6. Klik tombol **Run** (atau Ctrl+Enter)
7. Pastikan tidak ada error
8. Coba checkout lagi di aplikasi kasir

---

## Penjelasan:
- Kolom `harga_beli` diperlukan untuk menghitung laba/keuntungan
- Cache skema Supabase perlu di-refresh agar API mengenali kolom baru
- Setelah dijalankan, checkout QRIS akan berfungsi normal

---

**CATATAN:** File-file yang sudah diperbaiki di kode lokal:
- ✅ `lib/database.types.ts` - sudah ditambahkan `harga_beli`
- ✅ `supabase-schema.sql` - sudah ditambahkan `harga_beli`  
- ✅ `components/kasir/CheckoutDialog.tsx` - sudah diperbaiki (hapus camera, keterangan wajib)
- ⚠️ **Tinggal jalankan SQL di atas di Supabase Dashboard**
