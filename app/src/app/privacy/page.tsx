import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-slate-300 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 inline-block">
          ← Back to Celestia
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8 tracking-wide">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-400 leading-relaxed">
          <p className="text-sm text-slate-500">Last updated: January 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly when using Celestia 3:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Account information (email, display name via Google Sign-In)</li>
              <li>Birth data (date, time, location) for astrological calculations</li>
              <li>User preferences and settings</li>
              <li>Content you create (rituals, journal entries, synastry charts)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Calculate and display your natal chart and transits</li>
              <li>Generate personalized astrological insights</li>
              <li>Save your preferences across sessions</li>
              <li>Improve the Service based on usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely using Firebase (Google Cloud Platform). 
              We implement industry-standard security measures including encryption 
              in transit and at rest, and strict access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Firebase (authentication, database, hosting)</li>
              <li>Google Gemini (AI-powered insights)</li>
              <li>reCAPTCHA Enterprise (security)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Access your personal data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt out of non-essential data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. 
              Upon account deletion, your data will be removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>
              For privacy-related inquiries, please use the feedback system within 
              the application or contact us directly.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-600 text-sm">
          © {new Date().getFullYear()} Celestia 3. All rights reserved.
        </div>
      </div>
    </main>
  );
}
