// Quick Supabase connection test
// Run this with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing Supabase credentials in .env.local');
  console.error('   Make sure you have:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if we can query the training_sessions table
    console.log('Test 1: Querying training_sessions table...');
    const { data, error } = await supabase
      .from('training_sessions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Query failed:', error.message);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('   → The table does not exist. Did you run the SQL schema?');
      }
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('   → training_sessions table exists and is accessible');

    // Test 2: Check session_techniques table
    console.log('\nTest 2: Querying session_techniques table...');
    const { error: error2 } = await supabase
      .from('session_techniques')
      .select('count')
      .limit(1);

    if (error2) {
      console.error('❌ session_techniques query failed:', error2.message);
      return false;
    }

    console.log('✅ session_techniques table exists!');
    console.log('\n🎉 All tests passed! Supabase is properly configured.\n');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
