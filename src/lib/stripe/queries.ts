import { supabase } from '../supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Gets the current user's subscription
 */
export async function getUserSubscription(): Promise<{
  data: Subscription | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // No subscription found — treat as free user
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Checks if the current user has an active pro subscription
 */
export async function isProUser(): Promise<boolean> {
  const { data } = await getUserSubscription();
  if (!data) return false;
  return data.plan === 'pro' && (data.status === 'active' || data.status === 'trialing');
}

/**
 * Creates a free subscription record for a new user
 */
export async function createFreeSubscription(userId: string): Promise<{
  data: Subscription | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: 'free',
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}
