'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
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
  const isOnboardingRoute = pathname.startsWith('/onboarding') ||
                            pathname === '/force-onboard-complete';
  const isPublicRoute = pathname === '/' ||
                        pathname === '/privacy' ||
                        pathname === '/terms';
  const isNative = Capacitor.isNativePlatform();

  // Check onboarding status from Supabase
  useEffect(() => {
    async function checkOnboarding() {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      // Fast path 1: Check user_metadata (most reliable)
      if (user.user_metadata?.onboarding_complete === true) {
        setOnboardingComplete(true);
        setCheckingOnboarding(false);
        return;
      }

      // Fast path 2: Check localStorage immediately (avoid async call if possible)
      const localStorageComplete = typeof window !== 'undefined' &&
        localStorage.getItem('clinch-onboarding-complete') === 'true';

      if (localStorageComplete) {
        setOnboardingComplete(true);
        setCheckingOnboarding(false);
        return;
      }

      // Slow path: Full async check (for new users or edge cases)
      const completed = await isOnboardingComplete();
      setOnboardingComplete(completed);
      setCheckingOnboarding(false);
    }

    checkOnboarding();
  }, [user]);

  useEffect(() => {
    if (loading || checkingOnboarding) return; // Wait for auth and onboarding check to load

    // In native Capacitor app, skip marketing pages entirely
    if (isNative && isPublicRoute) {
      router.replace(user ? '/dashboard' : '/signin');
      return;
    }

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
  }, [user, loading, checkingOnboarding, onboardingComplete, pathname, isAuthRoute, isOnboardingRoute, isPublicRoute, isNative, router]);

  // Show loading state while checking auth and onboarding
  if (loading || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // In native app, don't render marketing pages (redirect is in progress)
  if (isNative && isPublicRoute) {
    return null;
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
