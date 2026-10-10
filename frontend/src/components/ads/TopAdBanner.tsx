'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

export function TopAdBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-[#0a0a0a] border-b border-pink-500/30 z-[45] flex items-center justify-center p-2 shadow-xl animate-in slide-in-from-top-10">
      <a 
        href="https://example.com/ad" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full max-w-3xl h-16 bg-zinc-900 overflow-hidden relative group cursor-pointer block rounded-md"
      >
        <img 
          src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop" 
          alt="Ad Banner" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 to-purple-900/60 flex items-center justify-between px-6">
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-base md:text-lg drop-shadow-md">Play Live Cams for Free</h4>
            <span className="text-[10px] text-pink-300 font-bold tracking-widest uppercase">Sponsored</span>
          </div>
          <button className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg transition-colors hidden md:block">
            Watch Now
          </button>
        </div>
      </a>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-zinc-400 hover:text-white transition-colors border border-white/10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
