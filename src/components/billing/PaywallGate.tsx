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
  // Early access: all features free — always render children
  return <>{children}</>;
}
