'use client';

import { useState } from 'react';
import Link from 'next/link';

function OctagonLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="11,2 21,2 30,11 30,21 21,30 11,30 2,21 2,11"
        stroke="#2563eb"
        strokeWidth="2"
        fill="none"
      />
      <polygon
        points="13,8 19,8 24,13 24,19 19,24 13,24 8,19 8,13"
        fill="#2563eb"
        opacity="0.3"
      />
    </svg>
  );
}

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060b18]/80 backdrop-blur-lg border-b border-[rgba(100,140,255,0.06)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <OctagonLogo />
          <span className="text-white font-semibold text-lg">MMA Tracker</span>
        </Link>

        {/* Right: Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-[#8899bb] hover:text-white text-sm transition-colors duration-150">
            Features
          </a>
          <a href="#pricing" className="text-[#8899bb] hover:text-white text-sm transition-colors duration-150">
            Pricing
          </a>
          <Link href="/signin" className="text-[#8899bb] hover:text-white text-sm transition-colors duration-150">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
          >
            Get Started Free
          </Link>
        </div>

        {/* Right: Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#8899bb] hover:text-white p-2"
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
        <div className="md:hidden bg-[#060b18] border-t border-[rgba(100,140,255,0.06)] px-4 py-4 flex flex-col gap-4">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="text-[#8899bb] hover:text-white text-sm transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="text-[#8899bb] hover:text-white text-sm transition-colors duration-150"
          >
            Pricing
          </a>
          <Link
            href="/signin"
            onClick={() => setMobileOpen(false)}
            className="text-[#8899bb] hover:text-white text-sm transition-colors duration-150"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold px-4 py-2 rounded-lg text-center transition-colors duration-150"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
