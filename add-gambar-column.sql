-- Script to add missing 'gambar' column to BahanBaku table
-- Run this in Supabase SQL Editor if you get "column 'gambar' does not exist" error

-- Add gambar column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'BahanBaku' 
        AND column_name = 'gambar'
    ) THEN
        ALTER TABLE "BahanBaku" ADD COLUMN "gambar" TEXT;
    END IF;
END $$;

-- Also add other potentially missing columns from the full schema
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'BahanBaku' 
        AND column_name = 'rasa'
    ) THEN
        ALTER TABLE "BahanBaku" ADD COLUMN "rasa" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'BahanBaku' 
        AND column_name = 'berat'
    ) THEN
        ALTER TABLE "BahanBaku" ADD COLUMN "berat" INTEGER NOT NULL DEFAULT 150;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'BahanBaku' 
        AND column_name = 'satuan'
    ) THEN
        ALTER TABLE "BahanBaku" ADD COLUMN "satuan" TEXT NOT NULL DEFAULT 'pcs';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'BahanBaku' 
        AND column_name = 'deskripsi'
    ) THEN
        ALTER TABLE "BahanBaku" ADD COLUMN "deskripsi" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'BahanBaku' 
        AND column_name = 'jenisProduk'
    ) THEN
        ALTER TABLE "BahanBaku" ADD COLUMN "jenisProduk" TEXT NOT NULL DEFAULT 'Makanan';
    END IF;
END $$;

-- Refresh Supabase schema cache (important!)
NOTIFY pgrst, 'reload schema';
