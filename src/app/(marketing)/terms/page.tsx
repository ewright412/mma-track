import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
      <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-150 mb-8 inline-block">
        &larr; Back to home
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

      <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
        <p className="text-gray-500 text-xs">Last updated: February 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Service</h2>
          <p>
            Clinch is a training tracking application provided as-is. We are currently in beta and actively developing new features. While we strive for reliability, we make no guarantees of uptime or data preservation during the beta period.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Your Account</h2>
          <p>
            You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account. One account per person.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Acceptable Use</h2>
          <p>
            Do not abuse the service. This includes but is not limited to: automated scraping, attempting to access other users&apos; data, using the service for illegal purposes, or intentionally disrupting the service for other users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Account Termination</h2>
          <p>
            We reserve the right to suspend or delete accounts that violate these terms. You may delete your own account at any time by contacting{' '}
            <a href="mailto:support@mmatracker.app" className="text-red-400 hover:text-red-300 transition-colors duration-150">
              support@mmatracker.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h2>
          <p>
            Clinch is provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable for any damages arising from use of the service. Training data should not be considered medical advice — always consult a qualified professional for health-related decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
