'use client';

import { ExternalLink, CheckCircle2 } from 'lucide-react';

export default function SponsorWatchBanner({ sponsor }: { sponsor: any }) {
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
      className="group block w-full rounded-[12px] bg-[#121214] border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg overflow-hidden mb-5 relative cursor-pointer"
    >
      {sponsor.thumbnail_url && (
        <div className="w-full h-32 relative overflow-hidden bg-zinc-900 border-b border-zinc-800/80">
          <img 
            src={sponsor.thumbnail_url} 
            alt={sponsor.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black tracking-wider bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 uppercase">
            {sponsor.badge_text || "SPONSORED"}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold truncate">
            <span>{sponsor.name}</span>
            <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:underline shrink-0">
            Visit <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>

        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
          {sponsor.title}
        </h4>

        {sponsor.description && (
          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
            {sponsor.description}
          </p>
        )}
      </div>
    </a>
  );
}
