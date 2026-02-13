'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { PageTransition } from './PageTransition';
import { AuthGuard } from '../auth/AuthGuard';
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is an auth route
  const isAuthRoute = pathname.startsWith('/signin') ||
                      pathname.startsWith('/signup') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password');
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isMarketingRoute = pathname === '/' ||
                          pathname === '/privacy' ||
                          pathname === '/terms';

  return (
    <AuthGuard>
      {/* For auth/onboarding/marketing routes, just render children without sidebar/header */}
      {isAuthRoute || isOnboardingRoute || isMarketingRoute ? (
        <>{children}</>
      ) : (
        <>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main
                id="main-content"
                role="main"
                aria-label="Main content"
                className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8"
                style={{ paddingBottom: 'max(6rem, calc(6rem + var(--safe-area-inset-bottom)))' }}
              >
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </>
      )}
    </AuthGuard>
  );
}
