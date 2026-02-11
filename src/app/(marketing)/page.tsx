import Link from 'next/link';

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

const allFeatures = [
  'Unlimited session logging',
  'All 6 disciplines',
  'Sparring round tracking',
  'Strength & cardio logs',
  'Unlimited goals & schedules',
  'Training notebook & technique library',
  'Achievement badges',
  'Advanced analytics & insights',
  'Training load monitoring',
  'Discipline balance radar',
  'Data export (CSV)',
  'Mobile PWA',
];

/* ── Dashboard Mockup (placeholder) ── */

function DashboardMockup() {
  return (
    <div className="bg-[#1a1a24] rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transform rotate-1 -mt-4 lg:-mt-8">
      {/* Browser top bar */}
      <div className="h-8 bg-[#252530] flex items-center gap-2 px-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <div className="mx-4 flex-1 bg-[#1a1a24] rounded-md h-4" />
      </div>

      {/* Dashboard content */}
      <div className="bg-[#0f0f13] p-4">
        {/* Stat cards row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-[#1a1a24] rounded-lg p-2.5">
            <div className="w-4 h-4 rounded bg-red-500/20 mb-1.5" />
            <div className="text-white text-sm font-bold">24</div>
            <div className="text-gray-500 text-[10px]">Sessions</div>
          </div>
          <div className="bg-[#1a1a24] rounded-lg p-2.5">
            <div className="w-4 h-4 rounded bg-blue-500/20 mb-1.5" />
            <div className="text-white text-sm font-bold">6</div>
            <div className="text-gray-500 text-[10px]">Disciplines</div>
          </div>
          <div className="bg-[#1a1a24] rounded-lg p-2.5">
            <div className="w-4 h-4 rounded bg-green-500/20 mb-1.5" />
            <div className="text-white text-sm font-bold">12h</div>
            <div className="text-gray-500 text-[10px]">This Week</div>
          </div>
          <div className="bg-[#1a1a24] rounded-lg p-2.5">
            <div className="w-4 h-4 rounded bg-yellow-500/20 mb-1.5" />
            <div className="text-white text-sm font-bold">3</div>
            <div className="text-gray-500 text-[10px]">New PRs</div>
          </div>
        </div>

        {/* Chart area */}
        <div className="bg-[#1a1a24] rounded-lg p-3 mb-3">
          <div className="text-[10px] text-gray-500 mb-2">Weekly Volume</div>
          <div className="flex items-end gap-1.5 h-16">
            <div className="flex-1 bg-red-500/30 rounded-t" style={{ height: '40%' }} />
            <div className="flex-1 bg-red-500/40 rounded-t" style={{ height: '55%' }} />
            <div className="flex-1 bg-red-500/30 rounded-t" style={{ height: '35%' }} />
            <div className="flex-1 bg-red-500/50 rounded-t" style={{ height: '70%' }} />
            <div className="flex-1 bg-red-500/60 rounded-t" style={{ height: '85%' }} />
            <div className="flex-1 bg-red-500/40 rounded-t" style={{ height: '50%' }} />
            <div className="flex-1 bg-red-500/70 rounded-t" style={{ height: '100%' }} />
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-[#1a1a24] rounded-lg p-3">
          <div className="text-[10px] text-gray-500 mb-2">Recent Sessions</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="text-[10px] text-gray-300 flex-1">Boxing Sparring</div>
              <div className="text-[10px] text-gray-500">90 min</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <div className="text-[10px] text-gray-300 flex-1">BJJ No-Gi</div>
              <div className="text-[10px] text-gray-500">60 min</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <div className="text-[10px] text-gray-300 flex-1">Muay Thai Pads</div>
              <div className="text-[10px] text-gray-500">75 min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat icons ── */

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
    </svg>
  );
}

function InfinityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

/* ── Page ── */

export default function LandingPage() {
  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left column — text */}
            <div className="flex-1 lg:max-w-[55%] text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                Train Smarter.<br />
                <span className="text-red-500">Fight Better.</span>
              </h1>

              <p className="text-lg text-gray-400 max-w-lg leading-relaxed mt-6 mx-auto lg:mx-0">
                The free training tracker built for martial artists. Log sessions across every discipline, analyze sparring, track PRs, and see your progress over time.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg shadow-red-500/20 transition-colors duration-150"
                >
                  Start Free &rarr;
                </Link>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white px-6 py-4 text-lg font-medium transition-colors duration-150"
                >
                  See Features &darr;
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 items-center justify-center lg:justify-start text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="text-green-500" /> Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="text-green-500" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="text-green-500" /> All 6 disciplines
                </span>
              </div>
            </div>

            {/* Right column — app mockup */}
            <div className="flex-1 lg:max-w-[45%] w-full max-w-md lg:max-w-none">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TRUST BAR ════════ */}
      <section className="py-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12">
          <div className="flex items-center gap-3">
            <GridIcon />
            <div>
              <div className="text-white font-bold text-2xl">6</div>
              <div className="text-gray-500 text-sm">Disciplines</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InfinityIcon />
            <div>
              <div className="text-white font-bold text-2xl">&infin;</div>
              <div className="text-gray-500 text-sm">Sessions</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon />
            <div>
              <div className="text-white font-bold text-2xl">100%</div>
              <div className="text-gray-500 text-sm">Free to Start</div>
            </div>
          </div>
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
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Free During Early Access
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Everything. Every feature. Completely free.
          </p>

          <div className="bg-[#1a1a24] border-2 border-red-500 rounded-xl p-8 relative">
            <span className="absolute top-0 right-6 -translate-y-1/2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Early Access
            </span>

            <h3 className="text-xl font-bold text-white">Clinch</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-gray-500">/forever</span>
            </div>

            <ul className="mt-8 space-y-3">
              {allFeatures.map((f) => (
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
              Get Started Free &rarr;
            </Link>
            <p className="text-xs text-gray-500 mt-3 text-center">
              We&apos;ll add Pro features later. Early users get the best deal.
            </p>
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
