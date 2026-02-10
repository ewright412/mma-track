'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  'Log training sessions',
  'Track cardio & strength',
  'Up to 3 active goals',
  'Basic body metrics',
  'Weekly volume chart',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited goals',
  'Training Notebook',
  'Training Load analytics',
  'Discipline Balance chart',
  'Data export (CSV)',
  'Achievement badges',
  'Priority support',
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to upgrade.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Pro">
      <div className="space-y-6">
        {/* Plans comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Free */}
          <div className="p-4 rounded-lg border border-white/[0.08] bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Free</h3>
            <div className="text-2xl font-bold text-white mb-4">$0</div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                  <Check className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">Pro</h3>
              <Zap className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              $9.99
              <span className="text-sm font-normal text-gray-400">/mo</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-4">7-day free trial</p>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-white/80">
                  <Check className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 text-sm font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating checkout...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Start 7-Day Free Trial
            </>
          )}
        </Button>

        <p className="text-[11px] text-gray-500 text-center">
          Cancel anytime. No charge until trial ends.
        </p>
      </div>
    </Modal>
  );
}
