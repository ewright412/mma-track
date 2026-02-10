'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from './UpgradeModal';

interface PaywallGateProps {
  isPro: boolean;
  feature: string;
  children: React.ReactNode;
}

export function PaywallGate({ isPro, feature, children }: PaywallGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        {/* Blurred preview */}
        <div className="pointer-events-none select-none blur-[6px] opacity-50">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f13]/60 rounded-lg">
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              Upgrade to unlock
            </p>
            <p className="text-xs text-gray-400 mb-4">{feature}</p>
            <Button
              size="sm"
              onClick={() => setShowUpgrade(true)}
              className="px-4 py-2 text-xs"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
