'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session AND fresh user data
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔐 AuthContext: Got session', { hasSession: !!session });
      setSession(session);

      // CRITICAL FIX: Get fresh user data to ensure we have latest user_metadata
      // This prevents stale onboarding_complete status
      if (session?.user) {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 AuthContext: Got fresh user data', {
          userId: user?.id,
          hasMetadata: !!user?.user_metadata,
          onboardingComplete: user?.user_metadata?.onboarding_complete,
          fullMetadata: user?.user_metadata
        });
        setUser(user);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Auth state changed', { event, hasSession: !!session });
      setSession(session);

      // CRITICAL FIX: Get fresh user data on auth state change
      // This ensures user_metadata is always up-to-date
      if (session?.user) {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 AuthContext: Got fresh user after state change', {
          event,
          userId: user?.id,
          onboardingComplete: user?.user_metadata?.onboarding_complete,
          fullMetadata: user?.user_metadata
        });
        setUser(user);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
