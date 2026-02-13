#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserData() {
  const userId = '29081428-c65d-45ab-9702-0972e2cf63ce'; // brentnlane@icloud.com

  console.log(`🔍 Checking data for user: ${userId}\n`);

  const checks = [
    { table: 'training_sessions', name: 'Training Sessions' },
    { table: 'sparring_logs', name: 'Sparring Logs' },
    { table: 'strength_logs', name: 'Strength Logs' },
    { table: 'cardio_logs', name: 'Cardio Logs' },
    { table: 'goals', name: 'Goals' },
  ];

  for (const check of checks) {
    const { data, error } = await supabase
      .from(check.table)
      .select('id')
      .eq('user_id', userId)
      .limit(5);

    if (error) {
      console.log(`❌ ${check.name}: Error - ${error.message}`);
    } else {
      console.log(`${data.length > 0 ? '✅' : '⚪'} ${check.name}: ${data.length} records`);
    }
  }
}

checkUserData();
