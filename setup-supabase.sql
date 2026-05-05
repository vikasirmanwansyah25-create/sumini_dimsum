-- Jalankan script ini di Supabase SQL Editor

-- 1. Buat tabel jika belum ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cabang table
CREATE TABLE IF NOT EXISTS cabang (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  cabang_id UUID REFERENCES cabang(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar TEXT
);

-- Bahan Baku table
CREATE TABLE IF NOT EXISTS bahan_baku (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  rasa VARCHAR(100),
  berat INTEGER NOT NULL,
  stok INTEGER NOT NULL,
  satuan VARCHAR(50) DEFAULT 'pcs',
  gambar TEXT,
  deskripsi TEXT,
  jenis_produk VARCHAR(50) DEFAULT 'Makanan',
  cabang_id UUID NOT NULL REFERENCES cabang(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu table
CREATE TABLE IF NOT EXISTS menu (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  harga INTEGER NOT NULL,
  harga_beli INTEGER,
  tersedia BOOLEAN DEFAULT TRUE,
  gambar TEXT,
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cabang_id UUID REFERENCES cabang(id) ON DELETE SET NULL
);

-- Resep table
CREATE TABLE IF NOT EXISTS resep (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
  bahan_baku_id UUID NOT NULL REFERENCES bahan_baku(id) ON DELETE CASCADE,
  jumlah INTEGER NOT NULL
);

-- Transaksi table
CREATE TABLE IF NOT EXISTS transaksi (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtotal INTEGER NOT NULL,
  total INTEGER NOT NULL,
  metode_pembayaran VARCHAR(50) NOT NULL,
  bayar INTEGER NOT NULL,
  kembalian INTEGER NOT NULL,
  catatan TEXT,
  keterangan TEXT,
  bukti_pembayaran TEXT,
  bukti_penjualan TEXT,
  tanggal TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Item table
CREATE TABLE IF NOT EXISTS cart_item (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaksi_id UUID NOT NULL REFERENCES transaksi(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menu(id),
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  harga INTEGER NOT NULL,
  jumlah INTEGER NOT NULL
);

-- 2. Disable Row Level Security (RLS) untuk memudahkan akses
ALTER TABLE cabang DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bahan_baku DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu DISABLE ROW LEVEL SECURITY;
ALTER TABLE resep DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_item DISABLE ROW LEVEL SECURITY;

-- 3. Berikan akses ke anon role
GRANT ALL ON cabang TO anon;
GRANT ALL ON users TO anon;
GRANT ALL ON bahan_baku TO anon;
GRANT ALL ON menu TO anon;
GRANT ALL ON resep TO anon;
GRANT ALL ON transaksi TO anon;
GRANT ALL ON cart_item TO anon;

-- 4. Berikan akses ke authenticated role (jika diperlukan nanti)
GRANT ALL ON cabang TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON bahan_baku TO authenticated;
GRANT ALL ON menu TO authenticated;
GRANT ALL ON resep TO authenticated;
GRANT ALL ON transaksi TO authenticated;
GRANT ALL ON cart_item TO authenticated;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_cabang ON users(cabang_id);
CREATE INDEX IF NOT EXISTS idx_bahanbaku_cabang ON bahan_baku(cabang_id);
CREATE INDEX IF NOT EXISTS idx_menu_cabang ON menu(cabang_id);
CREATE INDEX IF NOT EXISTS idx_resep_menu ON resep(menu_id);
CREATE INDEX IF NOT EXISTS idx_resep_bahanbaku ON resep(bahan_baku_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_user ON transaksi(user_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_transaksi ON cart_item(transaksi_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_menu ON cart_item(menu_id);

-- Selesai!
SELECT 'Setup completed!' AS status;
