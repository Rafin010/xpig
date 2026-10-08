export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-[#111] border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-3xl font-black text-white mb-8">DMCA & Copyright Policy</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Reporting Copyright Infringement</h2>
            <p>
              If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible via this site, please notify our copyright agent. We comply with the Digital Millennium Copyright Act (DMCA).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. User Liability</h2>
            <p>
              The platform owner assumes zero liability for content uploaded by users. Users who upload copyrighted material without authorization are solely and entirely responsible for any legal repercussions. 
              As stated in our Terms, the owner is free of any moral, Islamic, or legal liability regarding user-uploaded content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Takedown Requests</h2>
            <p>
              To file a DMCA takedown request, please provide a physical or electronic signature of the copyright owner, identification of the copyrighted work claimed to have been infringed, identification of the material that is claimed to be infringing, and contact information.
            </p>
          </section>

          <p className="pt-8 text-zinc-500 font-medium">Last updated: October 2026</p>
        </div>
      </div>
    </div>
  );
}
