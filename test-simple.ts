import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing connection...\n')
  
  // Ganti 'User' dengan nama tabel yang Anda buat di Supabase
  const { data, error } = await supabase
    .from('User')  // Gunakan nama tabel persis seperti di Supabase
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('Error:', error.message)
    console.log('Hint:', error.hint)
  } else {
    console.log('Success! Data:', data)
  }
}

test()
