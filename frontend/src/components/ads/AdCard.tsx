'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdCard() {
  return (
    <a 
      href="https://example.com/ad" 
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 relative cursor-pointer"
    >
      {/* Thumbnail Box */}
      <div className="aspect-[16/9] bg-[#1a1a1a] rounded-lg overflow-hidden relative border border-pink-500/30 group-hover:border-pink-500 transition-colors">
        <img 
          src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop" 
          alt="Advertisement" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 z-10">
          <h4 className="text-white font-bold text-lg leading-tight drop-shadow-md group-hover:text-pink-400 transition-colors">
            Play Premium 18+ Games
          </h4>
          <p className="text-xs text-pink-400 font-bold mt-1">NO CREDIT CARD REQUIRED</p>
        </div>

        {/* Ad Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-black text-pink-500 tracking-widest uppercase z-20 shadow-lg shadow-black/50 border border-pink-500/30">
          SPONSORED
        </div>
      </div>
    </a>
  );
}
