import { Mail, ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Advertise with XPIG - Sponsorships',
  description: 'Reach millions of users through our premium ad placements and direct sponsorships.',
};

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Advertise with <span className="text-pink-500">XPIG</span>
        </h1>
        
        <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
          Unlock unparalleled reach and engagement by advertising on one of the fastest-growing adult platforms. 
          Whether you want premium banner placements, sponsored video cards, or custom direct deals, we have the traffic you need.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
            <Users className="w-10 h-10 text-pink-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Massive Traffic</h3>
            <p className="text-sm text-zinc-400">Reach millions of daily active users with highly targeted ad placements.</p>
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
            <TrendingUp className="w-10 h-10 text-pink-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">High Conversion</h3>
            <p className="text-sm text-zinc-400">Our seamless UI ensures your ads get maximum visibility and click-through rates.</p>
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
            <ShieldCheck className="w-10 h-10 text-pink-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Brand Safety</h3>
            <p className="text-sm text-zinc-400">Your brand will be placed in secure, high-quality, and verified content areas.</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to setup a Direct Deal?</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            We offer custom sponsorship packages including homepage takeovers, pre-roll video ads, and permanent sponsored cards. Get in touch with our sales team to discuss custom pricing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:admin@xpig.me" 
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-pink-500/20"
            >
              <Mail className="w-5 h-5" />
              Email Us: admin@xpig.me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

