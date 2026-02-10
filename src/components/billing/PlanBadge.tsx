'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { PlanType } from '@/lib/stripe/config';

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className = '' }: PlanBadgeProps) {
  if (plan === 'pro') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-red-500/15 text-red-400 border border-red-500/20 ${className}`}
      >
        <Zap className="w-3 h-3" />
        Pro
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-white/10 text-gray-400 border border-white/[0.08] ${className}`}
    >
      Free
    </span>
  );
}
