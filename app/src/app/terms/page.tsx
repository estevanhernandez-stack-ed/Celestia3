import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-slate-300 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 inline-block">
          ← Back to Celestia
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8 tracking-wide">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-400 leading-relaxed">
          <p className="text-sm text-slate-500">Last updated: January 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Celestia 3 (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              Celestia 3 is an astrological exploration and personal development tool that provides 
              natal chart calculations, transit interpretations, and AI-generated insights. 
              The Service is provided for entertainment and educational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Disclaimer</h2>
            <p>
              The astrological interpretations, predictions, and insights provided by Celestia 3 
              are for entertainment purposes only and should not be used as a substitute for 
              professional medical, legal, financial, or psychological advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. You agree to notify us 
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Privacy</h2>
            <p>
              Your use of the Service is also governed by our <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>. 
              Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service 
              after any such changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>
              For any questions regarding these Terms of Service, please contact us through the 
              feedback system within the application.
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
