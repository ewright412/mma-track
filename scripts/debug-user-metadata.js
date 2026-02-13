#!/usr/bin/env node

/**
 * Debug script to check user metadata
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserMetadata() {
  console.log('🔍 Checking user metadata...\n');

  try {
    // Get all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    console.log(`Found ${users.length} total users\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Metadata:`, JSON.stringify(user.user_metadata, null, 2));
      console.log(`  onboarding_complete:`, user.user_metadata?.onboarding_complete);
      console.log(`  Type of onboarding_complete:`, typeof user.user_metadata?.onboarding_complete);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugUserMetadata();
