'use client';

import { useState } from 'react';
import Link from 'next/link';

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f13]/80 backdrop-blur-lg border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Clinch<span className="text-red-500">.</span>
        </Link>

        {/* Right: Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
            Features
          </a>
          <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
            Pricing
          </a>
          <Link href="/signin" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
          >
            Get Started Free
          </Link>
        </div>

        {/* Right: Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f0f13] border-t border-[rgba(255,255,255,0.06)] px-4 py-4 flex flex-col gap-4">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-150"
          >
            Pricing
          </a>
          <Link
            href="/signin"
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-150"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center transition-colors duration-150"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
