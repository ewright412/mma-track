'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PlanType } from '@/lib/stripe/config';

const ADMIN_EMAILS = ['wrightethan412@gmail.com'];

interface SubscriptionState {
  plan: PlanType;
  isPro: boolean;
  isLoading: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
}

export function useSubscription(): SubscriptionState {
  const [plan, setPlan] = useState<PlanType>('free');
  const [status, setStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setIsLoading(false);
          return;
        }

        // Admin override — full Pro access without a subscription
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          if (mounted) {
            setPlan('pro');
            setStatus('active');
            setCurrentPeriodEnd(null);
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .single();

        if (mounted) {
          if (error || !data) {
            setPlan('free');
            setStatus(null);
            setCurrentPeriodEnd(null);
          } else {
            const isActive = data.status === 'active' || data.status === 'trialing';
            setPlan(isActive && data.plan === 'pro' ? 'pro' : 'free');
            setStatus(data.status);
            setCurrentPeriodEnd(data.current_period_end);
          }
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setPlan('free');
          setIsLoading(false);
        }
      }
    }

    fetchSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    plan,
    isPro: plan === 'pro',
    isLoading,
    status,
    currentPeriodEnd,
  };
}
