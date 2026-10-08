export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-[#111] border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-3xl font-black text-white mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Assumption of Risk & Total Disclaimer of Liability</h2>
            <p>
              By accessing this website, you explicitly acknowledge and agree that <strong>the owner, developers, and administrators of this platform bear absolutely NO LIABILITY</strong> for any actions, behaviors, or sins (Gunah) committed by users on this platform. 
              From a legal, moral, and Islamic perspective, you as the user are 100% responsible for your own actions. We are providing a software platform; how it is used is solely the burden and responsibility of the individual user.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. 18+ Age Requirement</h2>
            <p>
              This website contains adult content. You must be at least 18 years of age, or the legal age of majority in your jurisdiction, to access this site. Access by minors is strictly prohibited. If you are under 18, you must leave this site immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User-Generated Content</h2>
            <p>
              All video content is uploaded by users. We do not pre-screen all content. If you upload content, you warrant that you hold the necessary rights and that the content does not violate any laws, including but not limited to laws regarding non-consensual media, CSAM, or extreme violence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless the platform and its owners from any claim, demand, or damage, including reasonable attorneys' fees, asserted by any third party due to or arising out of your use of or conduct on the platform.
            </p>
          </section>

          <p className="pt-8 text-zinc-500 font-medium">Last updated: October 2026</p>
        </div>
      </div>
    </div>
  );
}
