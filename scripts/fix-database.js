#!/usr/bin/env node

/**
 * Database Fix Script
 * 1. Check for and remove duplicate techniques
 * 2. Check for and remove duplicate challenges
 * 3. Report counts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndFixDuplicates() {
  console.log('🔍 Checking for duplicates...\n');

  try {
    // Check techniques
    const { data: techniques, error: techError } = await supabase
      .from('techniques')
      .select('*');

    if (techError) throw techError;

    console.log(`📊 Total techniques in database: ${techniques?.length || 0}`);

    // Find duplicates by name and discipline
    const techMap = new Map();
    const duplicates = [];

    techniques?.forEach(tech => {
      const key = `${tech.discipline}:${tech.name}`;
      if (techMap.has(key)) {
        duplicates.push(tech.id);
      } else {
        techMap.set(key, tech.id);
      }
    });

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate techniques`);
      console.log('🗑️  Removing duplicates...');

      const { error: deleteError } = await supabase
        .from('techniques')
        .delete()
        .in('id', duplicates);

      if (deleteError) throw deleteError;
      console.log(`✅ Removed ${duplicates.length} duplicate techniques\n`);
    } else {
      console.log('✅ No duplicate techniques found\n');
    }

    // Check daily challenges
    const { data: challenges, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('*');

    if (challengeError) throw challengeError;

    console.log(`📊 Total challenges in database: ${challenges?.length || 0}`);

    // Find duplicates by title
    const challengeMap = new Map();
    const challengeDuplicates = [];

    challenges?.forEach(challenge => {
      if (challengeMap.has(challenge.title)) {
        challengeDuplicates.push(challenge.id);
      } else {
        challengeMap.set(challenge.title, challenge.id);
      }
    });

    if (challengeDuplicates.length > 0) {
      console.log(`⚠️  Found ${challengeDuplicates.length} duplicate challenges`);
      console.log('🗑️  Removing duplicates...');

      const { error: deleteError } = await supabase
        .from('daily_challenges')
        .delete()
        .in('id', challengeDuplicates);

      if (deleteError) throw deleteError;
      console.log(`✅ Removed ${challengeDuplicates.length} duplicate challenges\n`);
    } else {
      console.log('✅ No duplicate challenges found\n');
    }

    // Final counts
    const { count: finalTechCount } = await supabase
      .from('techniques')
      .select('*', { count: 'exact', head: true });

    const { count: finalChallengeCount } = await supabase
      .from('daily_challenges')
      .select('*', { count: 'exact', head: true });

    console.log('\n📈 Final Counts:');
    console.log(`   Techniques: ${finalTechCount}`);
    console.log(`   Challenges: ${finalChallengeCount}`);
    console.log('\n✅ Database cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndFixDuplicates();
