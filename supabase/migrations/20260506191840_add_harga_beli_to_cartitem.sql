-- Add harga_beli column to CartItem table
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS harga_beli NUMERIC DEFAULT 0;

-- Update existing data with harga_beli from Menu table
UPDATE "CartItem" 
SET harga_beli = (
  SELECT m.harga_beli 
  FROM "Menu" m 
  WHERE m.id = "CartItem"."menuId"
)
WHERE harga_beli IS NULL OR harga_beli = 0;
