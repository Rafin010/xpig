import Link from 'next/link';
import { DigitalSignatureCard } from '@/components/legal/DigitalSignatureCard';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-4 sm:p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-6 mb-8">
          <div className="inline-block px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold rounded-full mb-3">
            Legal & Compliance Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms of Service & Disclaimer</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Effective Date: October 2026 • Mandatory User Agreement & Complete Administrative Indemnification
          </p>
        </div>
        
        <div className="space-y-8 text-sm leading-relaxed">

          {/* Section 1 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500 font-mono">1.</span>
              <span>Spiritual, Moral & Religious Disclaimer (User Sole Liability)</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              Viewing, streaming, or distributing the adult content hosted on this platform is considered morally reprehensible and a severe spiritual transgression (Gunah / Sin) under universally recognized Islamic and religious doctrines.
            </p>
            <p className="text-zinc-400">
              The platform administrators, owners, developers, and moderators explicitly object to and condemn immoral actions. All spiritual, religious, and moral consequences—including all spiritual transgressions (Gunah) and personal burdens—rest exclusively and entirely upon you, the individual user. The administrators bear absolutely <strong>zero moral or spiritual culpability</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500 font-mono">2.</span>
              <span>Complete Legal Indemnification & Administrative Immunity</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              By accessing, browsing, or utilizing this website, you irrevocably agree that the administrators, operators, hosting providers, and creators of XPIG are <strong>100% innocent, exempt, and legally immune</strong> from any and all legal liabilities, claims, prosecutions, regulatory penalties, damages, or disputes arising from your presence on or use of this platform.
            </p>
            <p className="text-zinc-400">
              Compliance with local, national, federal, and cyber laws of your jurisdiction is solely your responsibility. If accessing this website violates any applicable statute or regulation in your territory, you bear full and sole legal liability. No legal complaint, lawsuit, subpoena, or claim may be asserted against the platform or its administration.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500 font-mono">3.</span>
              <span>Strict 18+ Age Requirement & Voluntary Assumption of Risk</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              This website strictly presents adult audiovisual content intended exclusively for consenting individuals aged 18 years or older (or the legal age of majority in your jurisdiction).
            </p>
            <p className="text-zinc-400">
              Access by minors is expressly forbidden. By proceeding through our Age Gate, you declare under penalty of perjury that you are of legal age and that you are accessing this platform entirely voluntarily at your own discretion and risk.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500 font-mono">4.</span>
              <span>Mandatory User Obligation to Read & Legal Assumption of Terms</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              It is the mandatory duty of every visitor to review and understand these Terms of Service, our Privacy Policy, and our DMCA Copyright Notice prior to accessing the site.
            </p>
            <p className="text-zinc-400">
              Entering the website without reading these documents does not exempt you from them. Whether you have carefully reviewed or chosen to bypass reading these documents, your entry constitutes your unconditional acceptance of all terms, waivers, and disclaimers contained herein.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500 font-mono">5.</span>
              <span>Digital Signature & Legally Binding Consent</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Checking the confirmation box on the Age Gate compliance modal or executing the digital signature card below constitutes your legally binding digital signature under applicable electronic transaction laws. You affirm that you have waived all rights to initiate litigation against the platform or administrators and that you assume complete personal, moral, and legal liability.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500 font-mono">6.</span>
              <span>User-Generated Content & DMCA Notice</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              XPIG operates as an automated content repository. Content is provided by third-party creators and users. We prohibit unlawful, non-consensual, or infringing materials. For copyright or abuse takedown inquiries, please refer to our dedicated <Link href="/dmca" className="text-pink-400 hover:underline">DMCA Policy</Link>.
            </p>
          </section>

          {/* Interactive Digital Signature Execution Box */}
          <DigitalSignatureCard documentTitle="Terms of Service & Moral Disclaimer" />

          {/* Footer note */}
          <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© 2026 XPIG Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/dmca" className="text-zinc-400 hover:text-white transition-colors">DMCA Notice</Link>
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
