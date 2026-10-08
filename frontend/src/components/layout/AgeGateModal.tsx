'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('pig_legal_accepted');
    if (!hasAccepted) {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAccept = () => {
    if (agreed) {
      localStorage.setItem('pig_legal_accepted', 'true');
      setIsOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      {/* 3D Container Box */}
      <div 
        className="relative w-full max-w-md bg-[#161616] rounded-[2rem] p-1 
                   shadow-[0_20px_60px_-15px_rgba(236,72,153,0.3)] 
                   border border-zinc-800/80"
      >
        {/* Inner Card */}
        <div className="relative bg-[#0d0d0d] rounded-[1.8rem] p-8 overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Icon */}
          <div className="flex flex-col items-center text-center relative z-10 mb-8">
            <div className="w-24 h-24 mb-5 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full bg-[#111] rounded-[22px] flex items-center justify-center overflow-hidden">
                <img src="/pig-logo.png" alt="PIG Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-purple-300 drop-shadow-sm mb-3 tracking-tight">
              Welcome to PIG 🐷
            </h2>
            <p className="text-zinc-400 font-medium text-sm leading-relaxed max-w-[280px]">
              Before you dive into the premium experience, we need your consent on our community guidelines.
            </p>
          </div>

          {/* Single Unified Agreement Box (3D Style) */}
          <label className="relative z-10 flex items-start gap-4 p-5 bg-[#161616] hover:bg-[#1a1a1a] border-t border-l border-zinc-700/50 border-b border-r border-black rounded-2xl cursor-pointer transition-all duration-300 group shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] shadow-black/50 mb-8">
            <div className="relative flex items-center justify-center shrink-0 mt-1">
              <input 
                type="checkbox" 
                className="peer appearance-none w-7 h-7 bg-[#0a0a0a] border-2 border-zinc-600 rounded-xl checked:border-pink-500 checked:bg-pink-500 transition-all duration-300 cursor-pointer shadow-inner"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <CheckCircle2 className="w-5 h-5 text-white absolute opacity-0 peer-checked:opacity-100 peer-checked:scale-110 pointer-events-none transition-all duration-300 drop-shadow-md" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-[13.5px] font-medium text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                I am <strong className="text-pink-400">18+</strong> years old. I take full legal, moral, and Islamic responsibility for my actions here. The site owner is fully absolved of any liability. I agree to the <a href="/terms" target="_blank" className="text-pink-400 hover:underline">Terms</a> & <a href="/privacy" target="_blank" className="text-pink-400 hover:underline">Privacy</a>.
              </span>
            </div>
          </label>

          {/* 3D Action Button */}
          <div className="relative z-10">
            <button 
              onClick={handleAccept}
              disabled={!agreed}
              className={`
                w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 transform
                ${agreed 
                  ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow-[0_8px_0_rgb(190,24,93),0_15px_20px_rgba(236,72,153,0.4)] active:translate-y-[8px] active:shadow-[0_0px_0_rgb(190,24,93),0_5px_10px_rgba(236,72,153,0.4)] hover:-translate-y-1' 
                  : 'bg-zinc-800 text-zinc-500 shadow-[0_8px_0_rgb(39,39,42)] cursor-not-allowed opacity-70'}
              `}
            >
              ENTER PIG
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
