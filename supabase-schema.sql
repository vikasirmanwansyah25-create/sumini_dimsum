-- Supabase Database Schema for Keripik POS
-- Run this in Supabase SQL Editor

-- Cabang (Branches) table
CREATE TABLE IF NOT EXISTS "Cabang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BahanBaku (Raw Materials) table
CREATE TABLE IF NOT EXISTS "BahanBaku" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "rasa" TEXT,
    "berat" NUMERIC NOT NULL DEFAULT 0, 
    "stok" NUMERIC NOT NULL DEFAULT 0,
    "satuan" TEXT NOT NULL DEFAULT 'pcs' 
        CHECK ("satuan" IN ('pcs', 'box', 'pack', 'tabung', 'galon', 'set', 'roll', 'botol')),
    "deskripsi" TEXT,
    "gambar" TEXT,
    "jenisProduk" TEXT NOT NULL DEFAULT 'Frozen Food',
    "cabangId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cabang FOREIGN KEY ("cabangId") REFERENCES "Cabang"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Menu table
CREATE TABLE IF NOT EXISTS "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "harga_beli" INTEGER,
    "tersedia" BOOLEAN DEFAULT TRUE,
    "gambar" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cabangId" TEXT REFERENCES "Cabang"("id") ON DELETE SET NULL
);

-- Resep (Recipe) table
CREATE TABLE IF NOT EXISTS "Resep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuId" TEXT NOT NULL REFERENCES "Menu"("id") ON DELETE CASCADE,
    "bahanBakuId" TEXT NOT NULL REFERENCES "BahanBaku"("id") ON DELETE CASCADE,
    "jumlah" INTEGER NOT NULL
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cabangId" TEXT REFERENCES "Cabang"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT
);

-- Transaksi (Transaction) table
CREATE TABLE IF NOT EXISTS "Transaksi" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'TRX-' || extract(epoch from now())::bigint::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "subtotal" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "metodePembayaran" TEXT NOT NULL,
    "bayar" INTEGER NOT NULL,
    "kembalian" INTEGER NOT NULL,
    "catatan" TEXT,
    "keterangan" TEXT,
    "buktiPembayaran" TEXT,
    "buktiPenjualan" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CartItem table
CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'CI-' || extract(epoch from now())::bigint::text || '-' || floor(random() * 1000000)::text,
    "transaksiId" TEXT NOT NULL REFERENCES "Transaksi"("id") ON DELETE CASCADE,
    "menuId" TEXT NOT NULL REFERENCES "Menu"("id"),
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_beli" INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_cabang ON "User"("cabangId");
CREATE INDEX IF NOT EXISTS idx_bahanbaku_cabang ON "BahanBaku"("cabangId");
CREATE INDEX IF NOT EXISTS idx_menu_cabang ON "Menu"("cabangId");
CREATE INDEX IF NOT EXISTS idx_resep_menu ON "Resep"("menuId");
CREATE INDEX IF NOT EXISTS idx_resep_bahanbaku ON "Resep"("bahanBakuId");
CREATE INDEX IF NOT EXISTS idx_transaksi_user ON "Transaksi"("userId");
CREATE INDEX IF NOT EXISTS idx_cartitem_transaksi ON "CartItem"("transaksiId");
CREATE INDEX IF NOT EXISTS idx_cartitem_menu ON "CartItem"("menuId");
