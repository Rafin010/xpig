'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Check, ShieldCheck } from 'lucide-react';
import { recordLegalSignature } from '@/lib/device-detection';

export function AgeGateModal() {
  const router = useRouter();
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
      // Record official digital signature, timestamp and device info
      recordLegalSignature();
      setIsOpen(false);
      document.body.style.overflow = 'auto';

      // Redirect user to home page as requested
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        router.push('/');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto transition-all duration-300">
      {/* Container Box */}
      <div 
        className="relative w-full max-w-md bg-[#121215] rounded-3xl p-1 
                   shadow-2xl shadow-black/90 
                   border border-zinc-800 my-auto animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Inner Card */}
        <div className="relative bg-[#0c0c0e] rounded-[1.4rem] p-5 sm:p-6 overflow-hidden text-center">
          
          {/* Logo & 18+ Compliance Badge */}
          <div className="flex flex-col items-center relative z-10 mb-4">
            <div className="w-14 h-14 mb-2.5 rounded-2xl bg-zinc-900 border border-zinc-700/80 p-1 flex items-center justify-center shadow-md">
              <img src="/pig-logo.png" alt="XPIG" className="w-9 h-9 object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              <span>18+ Mandatory Compliance & Consent Gate</span>
            </div>
            
            <h2 className="text-xl font-bold text-white tracking-tight">
              Terms & Legal Indemnification
            </h2>
          </div>

          {/* Concise Legal Notice Box */}
          <div className="relative z-10 bg-[#141418] border border-zinc-800/80 rounded-2xl p-3.5 mb-4 text-left shadow-inner">
            <p className="text-zinc-300 text-xs leading-relaxed">
              This platform hosts adult audiovisual content intended strictly for consenting individuals aged 18 and older. You are required to review our official documentation prior to proceeding.
            </p>
            <p className="text-zinc-400 text-[11px] mt-1.5 leading-relaxed">
              Entering without reading does not exempt you from compliance; you voluntarily assume all personal, moral, spiritual (sins/gunah), and legal responsibilities. Platform operators and administrators are completely innocent and indemnified.
            </p>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Review Documentation:</span>
              <div className="flex items-center gap-2">
                <Link 
                  href="/terms" 
                  target="_blank" 
                  className="text-white hover:text-zinc-300 font-medium underline underline-offset-2 transition-colors"
                >
                  Terms
                </Link>
                <span className="text-zinc-600">•</span>
                <Link 
                  href="/privacy" 
                  target="_blank" 
                  className="text-white hover:text-zinc-300 font-medium underline underline-offset-2 transition-colors"
                >
                  Privacy
                </Link>
                <span className="text-zinc-600">•</span>
                <Link 
                  href="/dmca" 
                  target="_blank" 
                  className="text-white hover:text-zinc-300 font-medium underline underline-offset-2 transition-colors"
                >
                  DMCA
                </Link>
              </div>
            </div>
          </div>

          {/* Single Digital Signature Checkbox */}
          <label className="relative z-10 flex items-start gap-3 p-3 bg-[#141418] hover:bg-[#18181d] border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-colors group mb-4 text-left">
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 bg-[#0a0a0c] border-2 border-zinc-600 rounded checked:border-emerald-500 checked:bg-emerald-500 transition-colors cursor-pointer"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <Check className="w-3.5 h-3.5 text-white stroke-[3] absolute opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100 pointer-events-none transition-transform" />
            </div>
            
            <span className="text-[11.5px] font-medium text-zinc-300 group-hover:text-white transition-colors leading-snug">
              I certify that I am at least <strong className="text-white">18 years of age</strong> and agree to the Terms, Privacy Policy, and DMCA Notice. Checking this box constitutes my legally binding digital signature and full assumption of sole personal responsibility.
            </span>
          </label>

          {/* Action: Single Full-Width 3D Accept Button */}
          <div className="relative z-10 pt-1">
            <button 
              onClick={handleAccept}
              disabled={!agreed}
              className={`
                w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-150 select-none
                ${agreed 
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-t border-blue-400/40 border-b-4 border-blue-800 shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:border-b-0 active:translate-y-1 active:shadow-sm cursor-pointer' 
                  : 'bg-zinc-800 text-zinc-500 border-b-4 border-zinc-900/90 cursor-not-allowed opacity-50'}
              `}
            >
              <ShieldCheck className={`w-4 h-4 ${agreed ? 'text-blue-100' : 'text-zinc-500'}`} />
              <span>I Agree &amp; Enter Site</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
