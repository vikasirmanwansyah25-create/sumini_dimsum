import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDB() {
  console.log('🔍 Mengecek struktur database...\n')

  // Cek koneksi dasar
  try {
    const { data, error } = await supabase.rpc('version')
    if (error) {
      console.log('❌ Tidak bisa konek ke database')
      console.log('Error:', error.message)
    } else {
      console.log('✅ Koneksi database berhasil')
    }
  } catch (e: any) {
    console.log('❌ Error:', e.message)
  }

  // Coba query information_schema untuk lihat tabel yang ada
  console.log('\n📋 Mencoba lihat tabel yang ada...')
  
  // Test tiap tabel satu per satu dengan cara berbeda
  const tables = ['cabang', 'Cabang', 'CABANG', 'users', 'Users', 'USERS']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0)
      
      if (!error) {
        console.log(`✅ Tabel "${table}" ditemukan!`)
      } else {
        console.log(`❌ Tabel "${table}": ${error.message}`)
      }
    } catch (e: any) {
      console.log(`❌ Tabel "${table}": ${e.message}`)
    }
  }

  console.log('\n⚠️ SILAKAN JALANKAN SQL BERIKUT DI SUPABASE DASHBOARD:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Buka: https://dridkejfjvhrlmkwoguf.supabase.co')
  console.log('Klik: SQL Editor > New Query')
  console.log('Copy dan jalankan script di file: setup-supabase.sql')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

checkDB()
