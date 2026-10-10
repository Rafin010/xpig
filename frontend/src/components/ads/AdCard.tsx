'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function AdCard() {
  return (
    <a 
      href="mailto:info@xpig.me?subject=XPIG%20Video%20Grid%20Sponsorship" 
      className="group flex flex-col gap-2 relative cursor-pointer"
    >
      {/* Thumbnail Box */}
      <div className="aspect-[16/9] bg-[#1a1a1a] rounded-lg overflow-hidden relative border border-pink-500/30 group-hover:border-pink-500 transition-colors">
        <Image 
          src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop" 
          alt="Advertise with Us" 
          fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70" 
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 z-10">
          <h4 className="text-white font-bold text-lg leading-tight drop-shadow-md group-hover:text-pink-400 transition-colors">
            Your Brand Here
          </h4>
          <p className="text-xs text-pink-400 font-bold mt-1">CLICK TO BECOME A SPONSOR</p>
        </div>

        {/* Ad Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-black text-pink-500 tracking-widest uppercase z-20 shadow-lg shadow-black/50 border border-pink-500/30">
          ADVERTISE
        </div>
      </div>
    </a>
  );
}
