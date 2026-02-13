#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function markUserOnboarded() {
  const userId = '29081428-c65d-45ab-9702-0972e2cf63ce'; // brentnlane@icloud.com

  console.log(`Marking user ${userId} as onboarded...\n`);

  const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);

  if (getUserError) {
    console.error('❌ Error fetching user:', getUserError.message);
    return;
  }

  console.log('Current metadata:', JSON.stringify(user.user_metadata, null, 2));

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...user.user_metadata,
        onboarding_complete: true
      }
    }
  );

  if (updateError) {
    console.error('❌ Error updating user:', updateError.message);
  } else {
    console.log('✅ User marked as onboarded');

    // Verify
    const { data: { user: updatedUser } } = await supabase.auth.admin.getUserById(userId);
    console.log('\nUpdated metadata:', JSON.stringify(updatedUser.user_metadata, null, 2));
  }
}

markUserOnboarded();
