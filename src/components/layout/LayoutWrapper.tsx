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

  return (
    <AuthGuard>
      {/* For auth routes, just render children without sidebar/header */}
      {isAuthRoute ? (
        <>{children}</>
      ) : (
        <>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
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
