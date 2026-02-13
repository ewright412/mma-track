#!/usr/bin/env node

/**
 * One-time script to mark all existing users as having completed onboarding
 * This fixes the issue where existing users are being redirected to onboarding
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function markExistingUsersOnboarded() {
  console.log('🔍 Finding existing users with training data...\n');

  try {
    // Get all users who have training sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('user_id')
      .limit(1000);

    if (sessionsError) throw sessionsError;

    // Get unique user IDs
    const userIds = [...new Set(sessions?.map(s => s.user_id) || [])];

    console.log(`📊 Found ${userIds.length} users with training sessions`);

    if (userIds.length === 0) {
      console.log('✅ No users to update');
      return;
    }

    // Update each user's metadata
    let updated = 0;
    let errors = 0;

    for (const userId of userIds) {
      try {
        // Get user data first to check current metadata
        const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);

        if (getUserError) {
          console.error(`❌ Error fetching user ${userId}:`, getUserError.message);
          errors++;
          continue;
        }

        // Only update if not already marked complete
        if (!user?.user_metadata?.onboarding_complete) {
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
            console.error(`❌ Error updating user ${userId}:`, updateError.message);
            errors++;
          } else {
            updated++;
          }
        }
      } catch (err) {
        console.error(`❌ Error processing user ${userId}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Updated ${updated} users`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors occurred`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

markExistingUsersOnboarded();
