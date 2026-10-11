'use client';

import { ExternalLink, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function SponsorCard({ sponsor }: { sponsor: any }) {
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
      className="group flex flex-col gap-2 relative cursor-pointer"
    >
      {/* Thumbnail Box */}
      <div className="aspect-[16/9] bg-[#1a1a1a] rounded-[12px] overflow-hidden relative border border-zinc-800/80 group-hover:border-zinc-600 transition-colors">
        {sponsor.thumbnail_url ? (
          <Image 
            src={sponsor.thumbnail_url} 
            alt={sponsor.title || sponsor.name} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 font-bold text-xs">
            SPONSOR
          </div>
        )}

        {/* Sponsor Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-black text-amber-400 tracking-wider uppercase z-20 shadow-md border border-amber-500/30">
          {sponsor.badge_text || "SPONSORED"}
        </div>

        {/* Visit Indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-semibold text-zinc-300 z-20 flex items-center gap-1 border border-zinc-700/60">
          <span>Visit</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex gap-3 mt-1 px-1">
        <div className="w-9 h-9 bg-zinc-800 border border-zinc-700/80 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-amber-400">
          {sponsor.name ? sponsor.name.slice(0, 2).toUpperCase() : "AD"}
        </div>
        
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-medium text-[15px] text-zinc-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {sponsor.title}
          </h3>
          
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[13px] text-zinc-400 hover:text-white transition-colors truncate">
              {sponsor.name}
            </span>
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
          </div>

          <p className="text-[12px] text-zinc-500 mt-0.5 truncate">
            {sponsor.description || "Official Sponsor Partner"}
          </p>
        </div>
      </div>
    </a>
  );
}
