'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

export function TopAdBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[45] flex items-center justify-center p-2 shadow-none animate-in slide-in-from-top-10">
      <a 
        href="mailto:admin@xpig.me?subject=XPIG%20Premium%20Sponsorship%20Inquiry"
        className="w-full max-w-3xl h-16 bg-zinc-900 overflow-hidden relative group cursor-pointer block rounded-md border-0"
      >
        <Image 
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop" 
          alt="Advertise on XPIG" 
          fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/80 to-purple-900/80 flex items-center justify-between px-6">
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-base md:text-lg drop-shadow-md">Advertise on XPIG Platform</h4>
            <span className="text-[10px] text-pink-300 font-bold tracking-widest uppercase">Premium Placement</span>
          </div>
          <div className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg transition-colors hidden md:block">
            Email admin@xpig.me
          </div>
        </div>
      </a>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-zinc-400 hover:text-white transition-colors border-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

