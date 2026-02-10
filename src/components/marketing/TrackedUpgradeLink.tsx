'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics/posthog';

export function TrackedUpgradeLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent('upgrade_clicked', { source: 'pricing' })}
      className={className}
    >
      {children}
    </Link>
  );
}
