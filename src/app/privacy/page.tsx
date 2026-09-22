import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { LegalBulletList } from "@/components/LegalBulletList";
import { LEGAL_LAST_UPDATED } from "@/lib/date-utils";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicNav />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Motivate.me (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              goal tracking and habit building application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Account Information</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              When you create an account, we collect your name, email address, and profile photo
              through Google Sign-In authentication.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">User Content</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We store the goals, habits, milestones, daily logs, and other content you create
              within the application to provide our services.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Usage Data</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may collect information about how you access and use the application, including
              your device type, browser type, and interaction patterns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <LegalBulletList
              className="space-y-2 text-gray-600 dark:text-gray-300"
              items={
                [
                  { id: "to-provide-and-maintain-our-service", content: <>To provide and maintain our service</> },
                  { id: "to-personalize-your-experience-and-provide-ai-po", content: <>To personalize your experience and provide AI-powered insights</> },
                  { id: "to-improve-our-application-and-develop-new-featu", content: <>To improve our application and develop new features</> },
                  { id: "to-communicate-with-you-about-service-updates", content: <>To communicate with you about service updates</> }
                ]
              }
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Storage and Security</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your data is stored securely using Firebase/Google Cloud infrastructure. We implement
              appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We use the following third-party services:
            </p>
            <LegalBulletList
              className="mt-2 space-y-2 text-gray-600 dark:text-gray-300"
              items={
                [
                  { id: "firebase-google-authentication-database-and-stor", content: <><strong>Firebase (Google):</strong> Authentication, database, and storage</> },
                  { id: "openai-ai-powered-coaching-features-your-goal-da", content: <><strong>OpenAI:</strong> AI-powered coaching features (your goal data may be sent to generate insights)</> }
                ]
              }
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time
              through your account settings. You can also request a copy of your data or ask us to
              delete your account entirely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our
              GitHub repository or the contact information provided in the application.
            </p>
          </section>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
