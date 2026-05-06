const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dridkejfjvhrlmkwoguf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaWRrZWpnanZocmxta3dvZ3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTYzOTgsImV4cCI6MjA5MzI3MjM5OH0.vnsS5YFEsFUmHP8efTExehUneM-hM2RqCFxwFm0MdBE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('=== Checking Database Data ===\n');
  
  // Check transactions
  const { data: transaksi, error } = await supabase
    .from('Transaksi')
    .select('id, total, tanggal, userId')
    .order('tanggal', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return;
  }
  
  console.log('Recent Transactions:', transaksi?.length || 0);
  if (transaksi && transaksi.length > 0) {
    transaksi.forEach(t => {
      console.log(`- ID: ${t.id}, Total: ${t.total}, Date: ${t.tanggal}, User: ${t.userId}`);
    });
    
    // Check date range
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    console.log('\nDate check:');
    console.log('Now:', now.toISOString());
    console.log('7 days ago:', sevenDaysAgo.toISOString());
    
    const inRange = transaksi.filter(t => {
      const d = new Date(t.tanggal);
      return d >= sevenDaysAgo && d <= now;
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
    console.error('Error:', ciError);
  } else {
    console.log('CartItems found:', cartItems?.length || 0);
    if (cartItems && cartItems.length > 0) {
      console.log('Sample:', JSON.stringify(cartItems[0], null, 2));
    }
  }
  
  // Check Menu for harga_beli
  console.log('\n=== Checking Menu (harga_beli) ===');
  const { data: menus, error: menuError } = await supabase
    .from('Menu')
    .select('id, nama, harga, harga_beli')
    .limit(5);
  
  if (menuError) {
    console.error('Error:', menuError);
  } else {
    console.log('Menus found:', menus?.length || 0);
    if (menus && menus.length > 0) {
      menus.forEach(m => {
        console.log(`- ${m.nama}: harga=${m.harga}, harga_beli=${m.harga_beli}`);
      });
    }
  }
}

check().then(() => console.log('\nDone!'));
