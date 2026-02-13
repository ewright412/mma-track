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
    // Get current user WITHOUT refreshing session (performance optimization)
    // The AuthGuard already has the latest user from AuthContext
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // If metadata explicitly says onboarding is complete
    if (user.user_metadata?.onboarding_complete === true) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      return true;
    }

    // Check localStorage fallback (fast path)
    const localStorageComplete = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (localStorageComplete) {
      // Sync to user metadata in background (don't wait)
      if (!user.user_metadata?.onboarding_complete) {
        supabase.auth.updateUser({
          data: { onboarding_complete: true }
        }).then(() => {
          console.log('✅ Synced localStorage to user metadata');
        });
      }
      return true;
    }

    // For existing users without metadata, check if they have any data
    // If they have training sessions or sparring sessions, they're an existing user
    const { data: sessions, error } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!error && sessions && sessions.length > 0) {
      console.log('✅ Existing user with training data detected, auto-completing onboarding');
      await markOnboardingComplete();
      return true;
    }

    // Also check sparring sessions as fallback
    const { data: sparringSessions, error: sparringError } = await supabase
      .from('sparring_sessions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!sparringError && sparringSessions && sparringSessions.length > 0) {
      console.log('✅ Existing user with sparring data detected, auto-completing onboarding');
      await markOnboardingComplete();
      return true;
    }

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
  // Save to localStorage immediately (fast, synchronous fallback)
  localStorage.setItem(ONBOARDING_KEY, 'true');
  console.log('✅ Onboarding saved to localStorage');

  // Save to Supabase user metadata (source of truth)
  try {
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        onboarding_complete: true,
      }
    });

    if (updateError) {
      console.error('⚠️ Failed to update user metadata:', updateError);
      throw updateError;
    }

    console.log('✅ User metadata updated');

    // Refresh the session to get updated user metadata
    // Use a timeout to prevent hanging
    const refreshPromise = supabase.auth.refreshSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Session refresh timeout')), 3000)
    );

    await Promise.race([refreshPromise, timeoutPromise]);
    console.log('✅ Session refreshed successfully');
  } catch (error) {
    console.error('⚠️ Warning during onboarding completion:', error);
    // Don't throw - localStorage fallback will work
    // The session will eventually sync on next page load
  }
}
