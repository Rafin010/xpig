import { ShieldCheck, TrendingUp, Users, ExternalLink, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import SponsorContactButton from './SponsorContactButton';

export const metadata = {
  title: 'Advertise with XPIG - Sponsorships',
  description: 'Reach millions of users through our premium ad placements and direct sponsorships.',
};

async function getSponsors() {
  try {
    const res = await fetch('https://xpig.onrender.com/api/v1/sponsors/', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 py-12 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Advertise with <span className="text-zinc-100">XPIG</span>
        </h1>
        
        <p className="text-base md:text-lg text-zinc-400 mb-12 leading-relaxed">
          Unlock unparalleled reach and engagement by advertising on one of the fastest-growing video platforms. 
          Whether you want high-impact billboard banners, sponsored video cards, or custom direct deals, we deliver verified traffic.
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
            <Users className="w-9 h-9 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">High Volume Traffic</h3>
            <p className="text-sm text-zinc-400">Reach thousands of daily active viewers with targeted video and banner placements.</p>
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
            <TrendingUp className="w-9 h-9 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Verified Engagement</h3>
            <p className="text-sm text-zinc-400">Non-intrusive native cards ensure maximum click-through rates and high conversion.</p>
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
            <ShieldCheck className="w-9 h-9 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Brand Safety</h3>
            <p className="text-sm text-zinc-400">Your brand is displayed prominently in clean, high-performance UI components.</p>
          </div>
        </div>

        {/* Live Active Partners Section (Only if sponsors exist) */}
        {sponsors.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Our Official Partners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sponsors.map((sp: any) => (
                <a 
                  key={sp.id} 
                  href={sp.target_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#121214] border border-zinc-800 hover:border-zinc-700 rounded-[12px] p-5 flex flex-col justify-between group transition-all"
                >
                  <div>
                    {sp.thumbnail_url && (
                      <div className="w-full h-32 rounded-[8px] overflow-hidden bg-zinc-900 mb-4 border border-zinc-800">
                        <img src={sp.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-white text-base">{sp.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-200 line-clamp-1">{sp.title}</h4>
                    {sp.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{sp.description}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>Visit Partner Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact Deal CTA Card */}
        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to setup a Direct Sponsorship?</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            We offer custom sponsorship packages including homepage billboard banners, native feed cards, and sidebar placements. Get in touch with our partnerships team to discuss custom pricing.
          </p>
          
          <SponsorContactButton />
        </div>
      </div>
    </div>
  );
}
