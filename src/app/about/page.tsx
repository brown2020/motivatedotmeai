import Link from "next/link";

export default function AboutPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About Motivate.me</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            Motivate.me is an AI-powered goal tracking and habit building application designed to help you
            achieve your personal and professional objectives. We believe that with the right tools and
            guidance, anyone can make consistent progress toward their dreams.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            To empower individuals to take control of their personal development through intelligent
            goal tracking, habit formation, and AI-assisted coaching. We want to make the journey
            toward self-improvement accessible, enjoyable, and effective for everyone.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">What We Offer</h2>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
              <span><strong className="text-gray-900 dark:text-white">Goal Management:</strong> Set meaningful goals with milestones, deadlines, and progress tracking.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
              <span><strong className="text-gray-900 dark:text-white">Habit Tracking:</strong> Build positive daily habits with streak tracking and completion history.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
              <span><strong className="text-gray-900 dark:text-white">Daily Logging:</strong> Track your mood, energy, and notes to understand patterns in your journey.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-3">•</span>
              <span><strong className="text-gray-900 dark:text-white">AI Coaching:</strong> Get personalized insights and motivation from our AI assistant.</span>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Technology</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            Built with modern web technologies including Next.js, React, and Firebase, Motivate.me
            provides a fast, secure, and reliable experience. Our AI features are powered by OpenAI
            to deliver intelligent, contextual coaching tailored to your goals.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Open Source</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            Motivate.me is open source software licensed under the GNU Affero General Public License v3.0
            (AGPL-3.0). We believe in transparency and community-driven development.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/signin"
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
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
