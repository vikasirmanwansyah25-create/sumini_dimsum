import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false, autoRefreshToken: false }
})

async function seedDirect() {
  console.log('🌱 Seeding data dengan koneksi langsung...\n')

  try {
    // Insert Cabang
    console.log('1️⃣ Insert cabang...')
    const { data: cabang, error: err1 } = await supabase
      .from('cabang')
      .insert([{ nama: 'Pusat', alamat: 'Jl. Raya Utama', telepon: '081234567890' }])
      .select()
    
    if (err1) {
      console.error('Error cabang:', err1.message, err1.details)
      // Coba cek apakah tabel ada
      const { error: checkErr } = await supabase.rpc('version')
      console.log('Koneksi Supabase:', checkErr ? 'Error' : 'OK')
      return
    }
    console.log('✅ Cabang:', cabang)

    // Insert Users
    console.log('\n2️⃣ Insert users...')
    const { data: users, error: err2 } = await supabase
      .from('users')
      .insert([{
        username: 'admin',
        password: 'admin123',
        nama: 'Administrator',
        role: 'ADMIN',
        cabang_id: cabang?.[0]?.id
      }])
      .select()
    
    if (err2) {
      console.error('Error users:', err2.message, err2.details)
      return
    }
    console.log('✅ Users:', users)

    console.log('\n✅ Seeding selesai!')
    console.log('Login: admin / admin123')

  } catch (err: any) {
    console.error('Error:', err.message)
  }
}

seedDirect()
