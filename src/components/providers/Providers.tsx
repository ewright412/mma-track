'use client';

import { Suspense } from 'react';
import { PostHogProvider } from './PostHogProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PostHogProvider>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </PostHogProvider>
    </Suspense>
  );
}
