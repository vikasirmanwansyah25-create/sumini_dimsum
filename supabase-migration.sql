-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (WARNING: This will delete all data!)
-- Only run this if you want to recreate the tables from scratch
-- DROP TABLE IF EXISTS "User" CASCADE;
-- DROP TABLE IF EXISTS "Cabang" CASCADE;

-- Create Cabang table
CREATE TABLE IF NOT EXISTS "Cabang" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create BahanBaku table (Raw Materials)
CREATE TABLE IF NOT EXISTS "BahanBaku" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "rasa" TEXT,
    "berat" INTEGER NOT NULL DEFAULT 150,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "satuan" TEXT NOT NULL DEFAULT 'pcs' CHECK ("satuan" IN ('pcs', 'box', 'pack', 'gram', 'kg')),
    "gambar" TEXT,
    "deskripsi" TEXT,
    "jenisProduk" TEXT NOT NULL DEFAULT 'Makanan',
    "cabangId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "BahanBaku_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang"("id") ON DELETE CASCADE
);

-- Create Menu table
CREATE TABLE IF NOT EXISTS "Menu" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "harga_beli" INTEGER,
    "tersedia" BOOLEAN DEFAULT TRUE,
    "gambar" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "cabangId" UUID REFERENCES "Cabang"("id") ON DELETE SET NULL
);

-- Create Resep table (Recipe)
CREATE TABLE IF NOT EXISTS "Resep" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    "menuId" UUID NOT NULL REFERENCES "Menu"("id") ON DELETE CASCADE,
    "bahanBakuId" UUID NOT NULL REFERENCES "BahanBaku"("id") ON DELETE CASCADE,
    "jumlah" INTEGER NOT NULL
);

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL CHECK (role IN ('ADMIN', 'KASIR')),
    "cabangId" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "avatar" TEXT,
    CONSTRAINT "User_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang"("id") ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_cabangId_idx" ON "User"("cabangId");
CREATE INDEX IF NOT EXISTS "BahanBaku_cabangId_idx" ON "BahanBaku"("cabangId");
CREATE INDEX IF NOT EXISTS "Menu_cabangId_idx" ON "Menu"("cabangId");
CREATE INDEX IF NOT EXISTS "Resep_menuId_idx" ON "Resep"("menuId");
CREATE INDEX IF NOT EXISTS "Resep_bahanBakuId_idx" ON "Resep"("bahanBakuId");

-- Insert sample data (optional)
INSERT INTO "Cabang" ("nama", "alamat", "telepon") 
VALUES ('Cabang Utama', 'Jl. Contoh No. 123', '021-1234567')
ON CONFLICT DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO "User" ("username", "password", "nama", "role") 
VALUES ('admin', 'admin123', 'Administrator', 'ADMIN')
ON CONFLICT ("username") DO NOTHING;
