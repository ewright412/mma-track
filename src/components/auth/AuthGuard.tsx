'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { isOnboardingComplete } from '@/lib/utils/onboarding';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith('/signin') ||
                      pathname.startsWith('/signup') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password');
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isPublicRoute = pathname === '/';

  useEffect(() => {
    if (loading) return; // Wait for auth to load

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
    if (user && !isAuthRoute && !isOnboardingRoute && !isPublicRoute && !isOnboardingComplete()) {
      router.replace('/onboarding');
    }
  }, [user, loading, pathname, isAuthRoute, isOnboardingRoute, isPublicRoute, router]);

  // Show loading state while checking auth
  if (loading) {
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
