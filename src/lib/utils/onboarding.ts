import { supabase } from '../supabase/client';

const ONBOARDING_KEY = 'clinch-onboarding-complete';

/**
 * Checks if user has completed onboarding
 * First checks Supabase user metadata (source of truth)
 * Falls back to localStorage for backwards compatibility
 * For existing users, checks if they have any data (training sessions, etc.)
 */
export async function isOnboardingComplete(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('🔍 Onboarding check: No user');
      return false;
    }

    // If metadata explicitly says onboarding is complete
    if (user.user_metadata?.onboarding_complete === true) {
      console.log('✅ Onboarding complete via user_metadata');
      localStorage.setItem(ONBOARDING_KEY, 'true');
      return true;
    }

    // Check localStorage fallback
    const localStorageComplete = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (localStorageComplete) {
      console.log('✅ Onboarding complete via localStorage, syncing to user_metadata');
      // Sync to user metadata if not already there
      if (!user.user_metadata?.onboarding_complete) {
        await supabase.auth.updateUser({
          data: { onboarding_complete: true }
        });
        await supabase.auth.refreshSession();
      }
      return true;
    }

    // For existing users without metadata, check if they have any data
    // If they have training sessions, they're an existing user
    const { data: sessions, error } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!error && sessions && sessions.length > 0) {
      console.log('✅ Existing user with training data detected, auto-completing onboarding');
      // Existing user with data - auto-complete onboarding
      await markOnboardingComplete();
      return true;
    }

    console.log('❌ Onboarding not complete - no metadata, no localStorage, no training data');
    return false;
  } catch (error) {
    console.error('⚠️ Error checking onboarding status:', error);
    // Fallback to localStorage if Supabase check fails
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  }
}

/**
 * Synchronous version for use in components
 * Checks localStorage only (faster but less reliable)
 */
export function isOnboardingCompleteSync(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

/**
 * Marks onboarding as complete in both Supabase and localStorage
 */
export async function markOnboardingComplete(): Promise<void> {
  // Save to localStorage immediately
  localStorage.setItem(ONBOARDING_KEY, 'true');

  // Save to Supabase user metadata (source of truth)
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_complete: true,
      }
    });

    if (error) throw error;

    // CRITICAL: Refresh the session to get updated user metadata
    // This ensures the AuthContext receives the latest user data
    await supabase.auth.refreshSession();

    console.log('✅ Onboarding marked complete, session refreshed');
  } catch (error) {
    console.error('Failed to save onboarding status to Supabase:', error);
    // Continue anyway - localStorage will work as fallback
  }
}
