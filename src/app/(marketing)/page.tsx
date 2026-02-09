import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-20">
          {/* Badge */}
          <div className="mb-6">
            <span className="inline-block bg-[#2563eb]/10 text-[#3b82f6] text-xs px-3 py-1 rounded-full">
              Free for fighters
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl">
            Track Your MMA Training Like a Pro
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-[#8899bb] max-w-xl mt-6">
            Log sessions across every discipline. Analyze sparring. Track PRs. See your progress. Built by fighters, for fighters.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-150"
            >
              Start Free &rarr;
            </Link>
            <a
              href="#features"
              className="border border-[rgba(100,140,255,0.15)] text-[#8899bb] hover:text-white px-6 py-4 rounded-lg text-lg transition-colors duration-150"
            >
              See Features &darr;
            </a>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 border-y border-[rgba(100,140,255,0.06)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#4a6fa5]">
          <span>6 Disciplines</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>Real-time Analytics</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>100% Free to Start</span>
        </div>
      </section>

      {/* Features anchor for scroll */}
      <div id="features" />

      {/* Pricing anchor for scroll */}
      <div id="pricing" />
    </>
  );
}
