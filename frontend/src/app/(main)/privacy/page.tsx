export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-[#111] border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-3xl font-black text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us (such as email, username, and uploaded content) and information collected automatically (such as IP addresses, browser types, and cookies used for age-gate verification and sessions).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Legal Disclaimer</h2>
            <p>
              While we strive to protect your privacy, you acknowledge that your use of this site is at your own risk. The platform owner takes no moral or legal responsibility for the consequences of your usage. By using this site, you absolve the platform owner of all liabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Cookies & Tracking</h2>
            <p>
              We use local storage and cookies to remember your agreement to our Terms and Age Gate. This ensures the legal popup only appears once per lifetime on a given device/browser combination.
            </p>
          </section>

          <p className="pt-8 text-zinc-500 font-medium">Last updated: October 2026</p>
        </div>
      </div>
    </div>
  );
}
