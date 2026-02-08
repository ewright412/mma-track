'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith('/signin') ||
                      pathname.startsWith('/signup') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password');

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If on auth route and logged in, redirect to dashboard
    if (isAuthRoute && user) {
      console.log('[AuthGuard] User is logged in, redirecting to dashboard');
      router.replace('/dashboard');
    }

    // If on protected route and not logged in, redirect to signin
    if (!isAuthRoute && !user && pathname !== '/') {
      console.log('[AuthGuard] No user, redirecting to signin');
      router.replace('/signin');
    }
  }, [user, loading, pathname, isAuthRoute, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthRoute && !user && pathname !== '/') {
    return null;
  }

  // Don't render auth pages if already authenticated
  if (isAuthRoute && user) {
    return null;
  }

  return <>{children}</>;
}
