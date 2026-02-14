'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { markOnboardingComplete } from '@/lib/utils/onboarding';
import { CheckCircle, Loader2 } from 'lucide-react';

/**
 * Emergency utility page to force-complete onboarding
 * Visit /force-onboard-complete if you're stuck in an onboarding loop
 */
export default function ForceOnboardCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function forceComplete() {
      try {
        setMessage('Marking onboarding as complete...');
        await markOnboardingComplete();

        setMessage('Waiting for session to refresh...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStatus('success');
        setMessage('Success! Redirecting to dashboard...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Failed to complete onboarding. Check console for details.');
      }
    }

    forceComplete();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a24] border border-white/5 rounded-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-red-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-white mb-2">Fixing Onboarding Status</h1>
            <p className="text-gray-400 text-sm">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">All Fixed!</h1>
            <p className="text-gray-400 text-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Error</h1>
            <p className="text-gray-400 text-sm mb-4">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
            >
              Go to Dashboard Anyway
            </button>
          </>
        )}
      </div>
    </div>
  );
}
