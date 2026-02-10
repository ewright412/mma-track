import Link from 'next/link';
import { TrackedUpgradeLink } from '@/components/marketing/TrackedUpgradeLink';

/* ── Inline SVG Icons ── */

function SwordsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Feature data ── */

const features = [
  {
    icon: SwordsIcon,
    title: 'Training Log',
    desc: 'Track every session across Boxing, Muay Thai, BJJ, Wrestling, Kickboxing, and MMA.',
  },
  {
    icon: UsersIcon,
    title: 'Sparring Analytics',
    desc: 'Rate yourself round-by-round. Track striking, takedowns, and ground game trends.',
  },
  {
    icon: DumbbellIcon,
    title: 'Strength & PRs',
    desc: 'Log lifts, track volume, auto-detect personal records.',
  },
  {
    icon: CalendarIcon,
    title: 'Smart Scheduling',
    desc: 'Plan your training week and track your adherence.',
  },
  {
    icon: HeartIcon,
    title: 'Cardio Tracking',
    desc: 'Running, cycling, heavy bag, jump rope with distance and heart rate.',
  },
  {
    icon: BookOpenIcon,
    title: 'Training Notebook',
    desc: 'Jot down techniques, tag them, build your personal technique library.',
  },
];

const freeFeatures = [
  'Unlimited session logging',
  'All 6 disciplines',
  'Sparring round tracking',
  'Strength & cardio logs',
  '3 active goals',
  '1 schedule template',
  'Basic dashboard',
  'Mobile PWA',
];

const proFeatures = [
  'Unlimited goals & schedules',
  'Training notebook & technique library',
  'Achievement badges',
  'Advanced analytics & insights',
  'Training load monitoring',
  'Discipline balance radar',
  'Data export (CSV)',
  'Weekly share cards',
  'Priority support',
];

/* ── Page ── */

export default function LandingPage() {
  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-20">
          <div className="mb-6">
            <span className="inline-block bg-red-500/10 text-red-400 text-xs px-3 py-1 rounded-full">
              Free for fighters
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl">
            Track Your Training. Tighten Your Game.
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mt-6">
            The free training tracker built for fighters. Log sessions, analyze sparring, track PRs, and level up across every discipline.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-150"
            >
              Start Free &rarr;
            </Link>
            <a
              href="#features"
              className="border border-[rgba(255,255,255,0.15)] text-gray-400 hover:text-white px-6 py-4 rounded-lg text-lg transition-colors duration-150"
            >
              See Features &darr;
            </a>
          </div>
        </div>
      </section>

      {/* ════════ TRUST BAR ════════ */}
      <section className="py-12 border-y border-[rgba(255,255,255,0.06)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
          <span>6 Disciplines</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>Real-time Analytics</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>100% Free to Start</span>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need to level up
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(255,255,255,0.15)] transition-all"
              >
                <div className="text-red-500 mb-4">
                  <f.icon />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            Get started in 60 seconds
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-0">
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-400 font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-white font-semibold">Sign up free</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-[200px]">No credit card required. Takes 10 seconds.</p>
            </div>

            {/* Connector */}
            <div className="hidden md:flex items-center flex-shrink-0 w-16 mt-6">
              <div className="w-full border-t border-dashed border-[rgba(255,255,255,0.15)]" />
            </div>

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-400 font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-white font-semibold">Log your training</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Track sessions, sparring, cardio, and lifts.</p>
            </div>

            {/* Connector */}
            <div className="hidden md:flex items-center flex-shrink-0 w-16 mt-6">
              <div className="w-full border-t border-dashed border-[rgba(255,255,255,0.15)]" />
            </div>

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-400 font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-white font-semibold">Watch yourself improve</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Charts, streaks, and insights that keep you on track.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PRICING ════════ */}
      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Simple, honest pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-xl p-8">
              <h3 className="text-xl font-bold text-white">Clinch Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-500">/forever</span>
              </div>

              <ul className="mt-8 space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckIcon className="text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-8 block w-full text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-150"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#1a1a24] border-2 border-red-500 rounded-xl p-8 relative">
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>

              <h3 className="text-xl font-bold text-white">Clinch Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$7</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Everything in Free, plus:</p>

              <ul className="mt-6 space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckIcon className="text-red-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <TrackedUpgradeLink
                href="/signup"
                className="mt-8 block w-full text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-150"
              >
                Start 7-Day Free Trial
              </TrackedUpgradeLink>
              <p className="text-xs text-gray-500 mt-2 text-center">Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="py-24 bg-gradient-to-b from-[#0f0f13] to-[#1a1a24]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to track your progress?
          </h2>
          <p className="text-gray-400 mt-4">
            Join fighters who take their training seriously.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-8 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-150"
          >
            Start Free &rarr;
          </Link>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="py-12 border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-bold tracking-tight text-white">
            Clinch<span className="text-red-500">.</span>
          </span>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms</Link>
            <a href="mailto:support@mmatracker.app" className="hover:text-white transition-colors duration-150">Contact</a>
          </div>

          <p className="text-xs text-gray-500">&copy; 2026 Clinch. Built for fighters.</p>
        </div>
      </footer>
    </>
  );
}
