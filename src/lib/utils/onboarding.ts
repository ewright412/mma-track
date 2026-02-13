import { supabase } from '../supabase/client';

const ONBOARDING_KEY = 'clinch-onboarding-complete';

/**
 * Checks if user has completed onboarding
 * First checks Supabase user metadata (source of truth)
 * Falls back to localStorage for backwards compatibility
 */
export async function isOnboardingComplete(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.user_metadata?.onboarding_complete === true) {
      // Sync to localStorage for faster subsequent checks
      localStorage.setItem(ONBOARDING_KEY, 'true');
      return true;
    }

    // Fallback to localStorage for backwards compatibility
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch (error) {
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
    await supabase.auth.updateUser({
      data: {
        onboarding_complete: true,
      }
    });
  } catch (error) {
    console.error('Failed to save onboarding status to Supabase:', error);
    // Continue anyway - localStorage will work as fallback
  }
}
