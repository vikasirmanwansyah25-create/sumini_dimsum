-- Add harga_beli column to CartItem table for profit calculation
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS harga_beli INTEGER DEFAULT 0;
