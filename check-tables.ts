import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('Cek koneksi Supabase...\n')

  const tables = ['users', 'cabang', 'menu', 'bahan_baku', 'resep', 'transaksi', 'cart_item']
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ Tabel "${table}": ${error.message}`)
      } else {
        console.log(`✅ Tabel "${table}": ada (${count} rows)`)
      }
    } catch (err: any) {
      console.log(`❌ Tabel "${table}": ${err.message}`)
    }
  }

  console.log('\nCek data users:')
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .limit(5)
  
  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Data:', users)
  }
}

checkTables()
