import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
      <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-150 mb-8 inline-block">
        &larr; Back to home
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
        <p className="text-gray-500 text-xs">Last updated: February 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Data We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Email address (for authentication)</li>
            <li>Training data you enter (sessions, sparring logs, strength logs, cardio logs, goals, body metrics)</li>
            <li>Profile information you provide (display name, disciplines)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">How We Store It</h2>
          <p>
            Your data is stored securely on Supabase servers (backed by PostgreSQL). Authentication is handled by Supabase Auth. We use industry-standard encryption for data in transit and at rest.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What We Don&apos;t Do</h2>
          <p>
            We do not sell, rent, or share your personal data with third parties. Your training data belongs to you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Analytics</h2>
          <p>
            We use PostHog for anonymous usage analytics to improve the product. This helps us understand which features are used and where we can improve. No personal training data is sent to analytics.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Data Deletion</h2>
          <p>
            You can request deletion of your account and all associated data at any time by emailing{' '}
            <a href="mailto:support@mmatracker.app" className="text-red-400 hover:text-red-300 transition-colors duration-150">
              support@mmatracker.app
            </a>
            . We will process deletion requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
          <p>
            Questions about this policy? Email us at{' '}
            <a href="mailto:support@mmatracker.app" className="text-red-400 hover:text-red-300 transition-colors duration-150">
              support@mmatracker.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
