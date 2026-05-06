// Script to add harga_beli column to CartItem table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Adding harga_beli column to CartItem table...');
  
  // Try to add column using raw SQL via rpc
  // Note: This might not work with anon key, may need service role key
  try {
    const { data, error } = await supabase.rpc('add_harga_beli_column');
    
    if (error) {
      console.error('Error via RPC:', error.message);
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
      console.log(`
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "harga_beli" INTEGER DEFAULT 0;

UPDATE "CartItem" 
SET "harga_beli" = (
  SELECT m."harga_beli" 
  FROM "Menu" m 
  WHERE m."id" = "CartItem"."menuId"
)
WHERE "harga_beli" IS NULL OR "harga_beli" = 0;

NOTIFY pgrst, 'reload schema';
      `);
    } else {
      console.log('Migration successful!');
    }
  } catch (err) {
    console.error('Exception:', err.message);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log(`
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "harga_beli" INTEGER DEFAULT 0;

UPDATE "CartItem" 
SET "harga_beli" = (
  SELECT m."harga_beli" 
  FROM "Menu" m 
  WHERE m."id" = "CartItem"."menuId"
)
WHERE "harga_beli" IS NULL OR "harga_beli" = 0;

NOTIFY pgrst, 'reload schema';
    `);
  }
}

migrate();
