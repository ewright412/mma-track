'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Dumbbell, Brain, Flame, ChevronRight } from 'lucide-react';

function WelcomeFlow({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-0');

  useEffect(() => {
    // Fade in
    const t = setTimeout(() => setFadeClass('opacity-100'), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step === 0) {
      // Logo hold, then advance
      const t = setTimeout(() => {
        setFadeClass('opacity-0');
        setTimeout(() => { setStep(1); setFadeClass('opacity-100'); }, 300);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (step === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-opacity duration-1000 ${fadeClass}`}>
        <div className="text-center">
          <Image src="/clinch-logo.png" alt="Clinch" width={120} height={120} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Clinch</h1>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 transition-opacity duration-500 ${fadeClass}`}>
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">Train Smarter.</h1>
          <h1 className="text-3xl font-bold text-red-500 animate-fade-in" style={{ animationDelay: '500ms' }}>Fight Better.</h1>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 text-left animate-fade-in" style={{ animationDelay: '800ms' }}>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm text-gray-300">Track every session across 6 disciplines</p>
            </div>
            <div className="flex items-center gap-4 text-left animate-fade-in" style={{ animationDelay: '1100ms' }}>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">AI-powered coaching and analysis</p>
            </div>
            <div className="flex items-center gap-4 text-left animate-fade-in" style={{ animationDelay: '1400ms' }}>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-sm text-gray-300">Daily challenges to stay sharp</p>
            </div>
          </div>

          <div className="mt-12 space-y-3 animate-fade-in" style={{ animationDelay: '1700ms' }}>
            <button
              onClick={() => { onComplete(); router.push('/signup'); }}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.97]"
            >
              Get Started
            </button>
            <button
              onClick={() => { onComplete(); router.push('/signin'); }}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2"
            >
              Already have an account? <span className="text-red-400">Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showWelcome, setShowWelcome] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only show welcome on signin page, and only if first visit
    const hasVisited = localStorage.getItem('clinch-has-visited');
    if (!hasVisited && pathname === '/signin') {
      setShowWelcome(true);
    }
    setChecked(true);
  }, [pathname]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('clinch-has-visited', 'true');
    setShowWelcome(false);
  };

  if (!checked) return null;

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#0f0f13]">
        <WelcomeFlow onComplete={handleWelcomeComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo at top */}
      <div className="mb-6">
        <Image src="/clinch-logo.png" alt="Clinch" width={48} height={48} />
      </div>
      {children}
    </div>
  );
}
