'use client';

import { ExternalLink, CheckCircle2, Megaphone } from 'lucide-react';
import Image from 'next/image';

export default function SponsorBanner({ sponsor }: { sponsor: any }) {
  if (!sponsor) return null;

  const handleClick = () => {
    try {
      fetch(`https://xpig.onrender.com/api/v1/sponsors/${sponsor.id}/click`, { method: 'POST' }).catch(() => {});
    } catch (e) {}
  };

  return (
    <a 
      href={sponsor.target_url} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block w-full rounded-[12px] bg-gradient-to-r from-[#121214] via-[#161619] to-[#0f0f10] border border-zinc-800 hover:border-zinc-700 transition-all shadow-xl overflow-hidden mb-6 relative cursor-pointer"
    >
      <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Brand info & Offer headline */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-[10px] bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-black text-amber-400 text-sm shrink-0 shadow-inner">
            {sponsor.name ? sponsor.name.slice(0, 2).toUpperCase() : "AD"}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase inline-flex items-center gap-1">
                <Megaphone className="w-3 h-3 text-amber-400" />
                {sponsor.badge_text || "SPONSORED"}
              </span>
              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1 truncate">
                {sponsor.name}
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-white group-hover:text-amber-300 transition-colors truncate">
              {sponsor.title}
            </h3>

            {sponsor.description && (
              <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 max-w-2xl">
                {sponsor.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Creative banner preview & CTA */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0">
          {sponsor.thumbnail_url && (
            <div className="w-28 h-14 rounded-[8px] overflow-hidden relative border border-zinc-800 shrink-0 hidden sm:block">
              <img 
                src={sponsor.thumbnail_url} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="px-5 py-2.5 bg-white group-hover:bg-zinc-200 text-black rounded-[10px] font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md shrink-0">
            <span>Visit Sponsor</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-700" />
          </div>
        </div>

      </div>

      {/* Subtle border highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
