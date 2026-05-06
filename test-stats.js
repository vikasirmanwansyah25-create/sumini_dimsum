// Test script to check transactions and stats
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dridkejfjvhrlmkwoguf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaWRrZWpmanZocmxta3dvZ3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTYzOTgsImV4cCI6MjA5MzI3MjM5OH0.vnsS5YFEsFUmHP8efTExehUneM-hM2RqCFxwFm0MdBE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('=== Checking Transactions ===');
  
  // Get all transactions
  const { data: transaksi, error } = await supabase
    .from('Transaksi')
    .select('id, total, tanggal, userId')
    .order('tanggal', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Recent transactions:', transaksi?.length || 0);
  console.log(JSON.stringify(transaksi, null, 2));
  
  // Check date range for stats
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  console.log('\n=== Date Range ===');
  console.log('Now:', now.toISOString());
  console.log('7 days ago:', sevenDaysAgo.toISOString());
  
  // Check which transactions fall in the range
  if (transaksi) {
    const inRange = transaksi.filter(t => {
      const tgl = new Date(t.tanggal);
      return tgl >= sevenDaysAgo && tgl <= now;
    });
    console.log('Transactions in last 7 days:', inRange.length);
  }
  
  // Check CartItems
  console.log('\n=== Checking CartItems ===');
  const { data: cartItems, error: ciError } = await supabase
    .from('CartItem')
    .select('*')
    .limit(5);
  
  if (ciError) {
    console.error('CartItems error:', ciError);
  } else {
    console.log('CartItems found:', cartItems?.length || 0);
    console.log(JSON.stringify(cartItems, null, 2));
  }
}

test();
