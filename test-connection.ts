import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('=== Supabase Connection Test ===')
console.log('URL:', supabaseUrl)
console.log('Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...')
console.log('Key length:', supabaseKey?.length)
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

async function testConnection() {
  // Test 1: Check if project exists
  console.log('Test 1: Checking if project URL is accessible...')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
      }
    })
    console.log('Status:', response.status)
    const text = await response.text()
    console.log('Response:', text.substring(0, 200))
  } catch (err: any) {
    console.error('Fetch error:', err.message)
  }
  
  console.log('')
  
  // Test 2: Try Supabase client
  console.log('Test 2: Testing with Supabase client...')
  try {
    const { data, error, status } = await supabase.from('Cabang').select('*').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
    } else {
      console.log('Success! Data:', data)
    }
  } catch (err: any) {
    console.error('Unexpected error:', err.message)
  }
}

testConnection()
