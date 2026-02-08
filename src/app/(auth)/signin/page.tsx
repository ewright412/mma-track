'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data, error });

      if (error) throw error;

      if (data.session) {
        console.log('Session created, redirecting to dashboard...');
        // Small delay to ensure cookies are set before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = '/dashboard';
      } else {
        console.log('No session in response');
        setError('Sign in succeeded but no session was created. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400">
            Sign in to continue tracking your progress
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
