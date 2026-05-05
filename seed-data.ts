import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  console.log('🌱 Memulai seeding data...\n')

  // 1. Insert Cabang (Branch)
  console.log('1️⃣ Menambahkan cabang...')
  const { data: cabang, error: cabangError } = await supabase
    .from('cabang')
    .insert([
      { nama: 'Pusat', alamat: 'Jl. Raya Utama No. 123', telepon: '081234567890' },
      { nama: 'Cabang A', alamat: 'Jl. Sudirman No. 456', telepon: '081234567891' }
    ])
    .select()

  if (cabangError) {
    console.error('❌ Error insert cabang:', cabangError.message)
    return
  }
  console.log('✅ Cabang berhasil ditambahkan:', cabang)

  // 2. Insert Admin User
  console.log('\n2️⃣ Menambahkan user admin...')
  const { data: users, error: userError } = await supabase
    .from('users')
    .insert([
      { 
        username: 'admin', 
        password: 'admin123', 
        nama: 'Administrator', 
        role: 'ADMIN',
        cabang_id: cabang?.[0]?.id 
      },
      { 
        username: 'kasir1', 
        password: 'kasir123', 
        nama: 'Kasir 1', 
        role: 'KASIR',
        cabang_id: cabang?.[0]?.id 
      }
    ])
    .select()

  if (userError) {
    console.error('❌ Error insert user:', userError.message)
    return
  }
  console.log('✅ User berhasil ditambahkan:', users)

  // 3. Insert Bahan Baku (Raw Materials)
  console.log('\n3️⃣ Menambahkan bahan baku...')
  const { data: bahanBaku, error: bahanError } = await supabase
    .from('bahan_baku')
    .insert([
      { nama: 'Keripik Singkong Original', rasa: 'Original', berat: 100, stok: 100, satuan: 'pcs', jenis_produk: 'Makanan', cabang_id: cabang?.[0]?.id },
      { nama: 'Keripik Singkong Pedas', rasa: 'Pedas', berat: 100, stok: 80, satuan: 'pcs', jenis_produk: 'Makanan', cabang_id: cabang?.[0]?.id },
      { nama: 'Keripik Singkong Manis', rasa: 'Manis', berat: 100, stok: 90, satuan: 'pcs', jenis_produk: 'Makanan', cabang_id: cabang?.[0]?.id },
      { nama: 'Keripik Pisang Coklat', rasa: 'Coklat', berat: 100, stok: 70, satuan: 'pcs', jenis_produk: 'Makanan', cabang_id: cabang?.[1]?.id },
      { nama: 'Keripik Pisang Keju', rasa: 'Keju', berat: 100, stok: 85, satuan: 'pcs', jenis_produk: 'Makanan', cabang_id: cabang?.[1]?.id }
    ])
    .select()

  if (bahanError) {
    console.error('❌ Error insert bahan baku:', bahanError.message)
    return
  }
  console.log('✅ Bahan baku berhasil ditambahkan:', bahanBaku?.length, 'items')

  // 4. Insert Menu
  console.log('\n4️⃣ Menambahkan menu...')
  const { data: menu, error: menuError } = await supabase
    .from('menu')
    .insert([
      { nama: 'Keripik Singkong Original', kategori: 'Makanan', harga: 10000, harga_beli: 7000, tersedia: true, cabang_id: cabang?.[0]?.id },
      { nama: 'Keripik Singkong Pedas', kategori: 'Makanan', harga: 10000, harga_beli: 7000, tersedia: true, cabang_id: cabang?.[0]?.id },
      { nama: 'Keripik Singkong Manis', kategori: 'Makanan', harga: 10000, harga_beli: 7000, tersedia: true, cabang_id: cabang?.[0]?.id },
      { nama: 'Keripik Pisang Coklat', kategori: 'Makanan', harga: 12000, harga_beli: 8500, tersedia: true, cabang_id: cabang?.[1]?.id },
      { nama: 'Keripik Pisang Keju', kategori: 'Makanan', harga: 12000, harga_beli: 8500, tersedia: true, cabang_id: cabang?.[1]?.id }
    ])
    .select()

  if (menuError) {
    console.error('❌ Error insert menu:', menuError.message)
    return
  }
  console.log('✅ Menu berhasil ditambahkan:', menu?.length, 'items')

  // 5. Insert Resep (Recipe) - Link menu with bahan baku
  if (menu && bahanBaku) {
    console.log('\n5️⃣ Menambahkan resep...')
    const resepData = [
      { menu_id: menu[0].id, bahan_baku_id: bahanBaku[0].id, jumlah: 1 },
      { menu_id: menu[1].id, bahan_baku_id: bahanBaku[1].id, jumlah: 1 },
      { menu_id: menu[2].id, bahan_baku_id: bahanBaku[2].id, jumlah: 1 },
      { menu_id: menu[3].id, bahan_baku_id: bahanBaku[3].id, jumlah: 1 },
      { menu_id: menu[4].id, bahan_baku_id: bahanBaku[4].id, jumlah: 1 }
    ]

    const { error: resepError } = await supabase
      .from('resep')
      .insert(resepData)

    if (resepError) {
      console.error('❌ Error insert resep:', resepError.message)
      return
    }
    console.log('✅ Resep berhasil ditambahkan:', resepData.length, 'items')
  }

  console.log('\n✅ Seeding selesai!')
  console.log('\n📝 Data login:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
}

seedData()
