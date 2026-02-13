'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { isOnboardingComplete } from '@/lib/utils/onboarding';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const isAuthRoute = pathname.startsWith('/signin') ||
                      pathname.startsWith('/signup') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password');
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isPublicRoute = pathname === '/';

  // Check onboarding status from Supabase
  useEffect(() => {
    async function checkOnboarding() {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      // Direct check: if user_metadata already has onboarding_complete, trust it
      // This prevents the need for async check on every render
      if (user.user_metadata?.onboarding_complete === true) {
        console.log('✅ Fast path: User metadata shows onboarding complete');
        setOnboardingComplete(true);
        setCheckingOnboarding(false);
        return;
      }

      const completed = await isOnboardingComplete();
      console.log('🔍 Onboarding check result:', completed, 'User metadata:', user.user_metadata);
      setOnboardingComplete(completed);
      setCheckingOnboarding(false);
    }

    checkOnboarding();
  }, [user]);

  useEffect(() => {
    if (loading || checkingOnboarding) return; // Wait for auth and onboarding check to load

    // If on auth route and logged in, redirect to dashboard
    if (isAuthRoute && user) {
      router.replace('/dashboard');
    }

    // If on public marketing route and logged in, redirect to dashboard
    if (isPublicRoute && user) {
      router.replace('/dashboard');
    }

    // If on protected route and not logged in, redirect to signin
    if (!isAuthRoute && !isOnboardingRoute && !isPublicRoute && !user) {
      router.replace('/signin');
    }

    // If logged in and hasn't completed onboarding, redirect to onboarding
    if (user && !isAuthRoute && !isOnboardingRoute && !isPublicRoute && !onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [user, loading, checkingOnboarding, onboardingComplete, pathname, isAuthRoute, isOnboardingRoute, isPublicRoute, router]);

  // Show loading state while checking auth and onboarding
  if (loading || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthRoute && !isPublicRoute && !user) {
    return null;
  }

  // Don't render auth pages if already authenticated
  if ((isAuthRoute || isPublicRoute) && user) {
    return null;
  }

  return <>{children}</>;
}
