import Link from 'next/link';
import { DigitalSignatureCard } from '@/components/legal/DigitalSignatureCard';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-4 sm:p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-6 mb-8">
          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full mb-3">
            Intellectual Property & Copyright Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">DMCA & Copyright Policy</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Effective Date: October 2026 • Notice, Takedown Procedure & User Liability
          </p>
        </div>
        
        <div className="space-y-8 text-sm leading-relaxed">

          {/* Section 1 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400 font-mono">1.</span>
              <span>Reporting Copyright Infringement (DMCA Compliance)</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              XPIG respects intellectual property rights and adheres strictly to the provisions of the Digital Millennium Copyright Act (17 U.S.C. § 512). 
            </p>
            <p className="text-zinc-400">
              If you are a copyright owner or an agent thereof and believe that any audiovisual material or content hosted on this site infringes upon your copyright, you may submit a formal notification to our Designated Copyright Agent.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400 font-mono">2.</span>
              <span>Exclusive User Liability & Zero Platform Endorsement</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              The platform administrators, owners, and developers operate purely as automated hosting service providers. We do not pre-screen or produce user-uploaded media.
            </p>
            <p className="text-zinc-400">
              Users who upload unauthorized, copyrighted, or unlawful material bear 100% individual, civil, and criminal liability under all applicable legal jurisdictions. The platform and its administrators are completely innocent, immune, and indemnified from all claims resulting from user contributions.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400 font-mono">3.</span>
              <span>Takedown Notice Requirements</span>
            </h2>
            <p className="text-zinc-300 mb-3">
              A valid DMCA takedown notification must include the following information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed, or a representative list of such works.</li>
              <li>Identification of the material that is claimed to be infringing and direct URL links sufficient to permit XPIG to locate the material.</li>
              <li>Information reasonably sufficient to permit our designated agent to contact the complaining party (email address, telephone number).</li>
              <li>A statement that the complaining party has a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400 font-mono">4.</span>
              <span>Designated Copyright Agent Contact</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Inquiries, notifications, and counter-notifications should be addressed directly to our compliance and legal desk at:
              <br />
              <strong className="text-white font-mono mt-1 block">legal@xpig.live / dmca-notice@xpig.live</strong>
            </p>
          </section>

          {/* Interactive Digital Signature Execution Box */}
          <DigitalSignatureCard documentTitle="DMCA & Copyright Policy" />

          {/* Footer note */}
          <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© 2026 XPIG Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
