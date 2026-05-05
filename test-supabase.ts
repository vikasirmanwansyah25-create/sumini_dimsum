import { supabase } from './lib/supabaseClient'
async function testConnection() {
  const { data, error } = await supabase
    .from('Cabang')
    .select('*')
  
  if (error) {
    console.error('Gagal koneksi Supabase:', error.message)
  } else {
    console.log('Berhasil koneksi! Data Cabang:', data)
  }
}
testConnection()