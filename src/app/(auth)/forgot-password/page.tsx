'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-sm text-gray-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400">
              Password reset email sent! Check your inbox for the reset link.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/signin"
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </Card>
  );
}
