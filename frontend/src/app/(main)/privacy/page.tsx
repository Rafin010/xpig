import Link from 'next/link';
import { DigitalSignatureCard } from '@/components/legal/DigitalSignatureCard';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-4 sm:p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-6 mb-8">
          <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-full mb-3">
            Data Privacy & Security Protocols
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Effective Date: October 2026 • Compliance, Cookies & Telemetry Architecture
          </p>
        </div>
        
        <div className="space-y-8 text-sm leading-relaxed">

          {/* Section 1 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-purple-400 font-mono">1.</span>
              <span>Information & Security Telemetry Collected</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              To guarantee platform stability, verify compliance with age limitations, and maintain anti-abuse security, XPIG processes the following technical telemetry:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Network identifiers (IP address, approximate geographic location, ISP provider).</li>
              <li>Client device information (Hardware model, operating system, browser engine).</li>
              <li>Engagement metrics (Total clicks, videos viewed, watch time duration).</li>
              <li>Authentication profiles provided voluntarily via third-party OAuth providers (e.g. Google).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-purple-400 font-mono">2.</span>
              <span>Persistent Cookies & Device Telemetry Tokens</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-3">
              We employ secure local storage tokens and encrypted cookies (such as <code className="text-pink-400 bg-pink-950/40 px-1.5 py-0.5 rounded">xpig_tracker_cookie</code> and compliance tokens) to record your digital agreement to our 18+ Age Gate and Terms of Service.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              These tokens ensure you are not prompted repeatedly on every page navigation while maintaining an immutable legal audit log of your consent, identity continuity, and assumption of personal liability.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-purple-400 font-mono">3.</span>
              <span>Total Administrative Exemption & Legal Liability Waiver</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Users acknowledge that the transmission and access of data occur at their own voluntary initiative and risk. The platform owners, administrators, and developers bear no moral, spiritual (sins/gunah), or legal responsibility for user interactions or consumption. All liabilities remain strictly with the individual user as detailed in our Terms of Service.
            </p>
          </section>

          {/* Interactive Digital Signature Execution Box */}
          <DigitalSignatureCard documentTitle="Privacy Policy" />

          {/* Footer note */}
          <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© 2026 XPIG Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/dmca" className="text-zinc-400 hover:text-white transition-colors">DMCA Notice</Link>
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
