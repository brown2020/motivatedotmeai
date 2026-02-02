import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Motivate.me
          </Link>
          <Link
            href="/signin"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              By accessing or using Motivate.me, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Motivate.me is an AI-powered goal tracking and habit building application. We provide
              tools for setting goals, tracking habits, logging daily activities, and receiving
              AI-generated insights to help you achieve your objectives.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              To use Motivate.me, you must create an account using Google Sign-In. You are responsible
              for maintaining the confidentiality of your account and for all activities that occur
              under your account.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You agree to provide accurate and complete information when creating your account and
              to update your information as necessary.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. User Content</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              You retain ownership of all content you create within Motivate.me, including goals,
              habits, milestones, and daily logs. By using our service, you grant us a license to
              store, process, and display your content as necessary to provide the service.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You agree not to submit content that is illegal, harmful, threatening, abusive, or
              otherwise objectionable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. AI Features</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our AI coaching features are powered by third-party AI services (OpenAI). While we
              strive to provide helpful and accurate insights, AI-generated content is provided
              for informational purposes only and should not be considered professional advice.
              Always use your own judgment when making decisions about your goals and habits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Acceptable Use</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">You agree not to:</p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
                <span>Use the service for any unlawful purpose</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
                <span>Attempt to gain unauthorized access to any part of the service</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
                <span>Interfere with or disrupt the service or its servers</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
                <span>Use automated systems to access the service without permission</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Motivate.me is open source software licensed under the GNU Affero General Public
              License v3.0 (AGPL-3.0). The source code is available on GitHub. The Motivate.me
              name, logo, and branding are proprietary and may not be used without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Motivate.me is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any
              kind, either express or implied. We do not guarantee that the service will be
              uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Motivate.me shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising out of
              or relating to your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify
              you of any changes by posting the new terms on this page. Your continued use of
              the service after any changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Termination</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may terminate or suspend your access to the service at any time, without prior
              notice or liability, for any reason, including if you breach these Terms of Service.
              You may also delete your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through
              our GitHub repository or the contact information provided in the application.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Motivate.me. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/about" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                About
              </Link>
              <Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
