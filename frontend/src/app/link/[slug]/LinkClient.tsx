'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';

interface LinkData {
  slug: string;
  destination_url: string;
  first_click_url?: string;
  second_click_url?: string;
  is_ad_mode?: boolean;
}

function GatewayContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const step = searchParams.get('step') || '1';
  
  const [timeLeft, setTimeLeft] = useState(5);
  const [canProceed, setCanProceed] = useState(false);
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Adsterra / Sponsor link
  const adDirectLink = "https://xpig.me";

  useEffect(() => {
    // Fetch destination from API
    fetch(`https://xpig.onrender.com/api/v1/links/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Link not found');
        return res.json();
      })
      .then((data: LinkData) => {
        setLinkData(data);

        // If NOT in ad mode -> Handle Instant Double-Click Redirect
        if (!data.is_ad_mode) {
          setRedirecting(true);
          const gateKey = `xpig_gate_${slug}`;
          const lastVisit = localStorage.getItem(gateKey);
          const isSecondClick = lastVisit && (Date.now() - parseInt(lastVisit, 10) < 3600000); // within 1 hour

          // Register click in background
          fetch(`https://xpig.onrender.com/api/v1/links/${slug}/click`, { method: 'POST' }).catch(() => {});

          if (!isSecondClick) {
            // 1ST CLICK: Record visit & redirect immediately to XPIG Website
            localStorage.setItem(gateKey, Date.now().toString());
            const target = data.first_click_url || 'https://xpig.me';
            window.location.replace(target);
          } else {
            // 2ND CLICK: Clear gate & redirect directly to the real destination
            localStorage.removeItem(gateKey);
            const target = data.second_click_url || data.destination_url;
            window.location.replace(target);
          }
          return;
        }

        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (linkData?.is_ad_mode && step === '1' && !loading && !error) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setCanProceed(true);
      }
    } else if (step === '2') {
      setCanProceed(true);
    }
  }, [timeLeft, step, loading, error, linkData]);

  const handleContinueStep1 = () => {
    window.open(adDirectLink, '_blank');
    router.push(`/link/${slug}?step=2`);
  };

  const handleContinueStep2 = async () => {
    try {
      await fetch(`https://xpig.onrender.com/api/v1/links/${slug}/click`, { method: 'POST' });
    } catch (_) {}

    const destination = linkData?.second_click_url || linkData?.destination_url;
    if (destination) {
      window.location.href = destination;
    }
  };

  if (redirecting || loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
            <ShieldCheck className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
              XPIG Secure Gateway
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {redirecting ? 'রিডাইরেক্ট করা হচ্ছে...' : 'লিংক ভেরিফাই করা হচ্ছে...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center text-white p-4 text-center">
        <div className="max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800">
          <h1 className="text-2xl font-bold text-red-500 mb-2">ইনভ্যালিড লিংক</h1>
          <p className="text-zinc-400 text-sm">আপনি যে লিংকটিতে প্রবেশের চেষ্টা করছেন তা মেয়াদোত্তীর্ণ বা অস্তিত্বহীন।</p>
          <a
            href="https://xpig.me"
            className="mt-6 inline-block w-full py-3 px-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            XPIG হোমপেজে যান
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center py-10 px-4 font-sans text-white">
      {/* Top Banner Slot */}
      <div className="w-full max-w-2xl h-24 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-xs mb-8 shadow-sm">
        [ Sponsored Promotion Space ]
      </div>

      <div className="max-w-md w-full bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-700 p-6 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">XPIG Gateway</h1>
          <p className="text-pink-100 text-xs mt-1">আপনার গন্তব্য লিংকটি প্রস্তুত করা হচ্ছে</p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {step === '1' ? (
            <>
              <h2 className="text-lg font-bold text-zinc-200 mb-2">ধাপ ১ / ২</h2>
              <p className="text-xs text-zinc-400 mb-6">স্প্যাম ও বট প্রতিরোধে কয়েক সেকেন্ড অপেক্ষা করুন।</p>
              
              {!canProceed ? (
                <div className="flex flex-col items-center py-4">
                  <div className="text-5xl font-black text-pink-500 mb-1">{timeLeft}</div>
                  <p className="text-zinc-500 font-semibold tracking-wider text-xs uppercase">সেকেন্ড বাকি</p>
                </div>
              ) : (
                <button 
                  onClick={handleContinueStep1}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
                >
                  পরবর্তী ধাপ <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-zinc-200 mb-2">চূড়ান্ত ধাপ!</h2>
              <p className="text-xs text-zinc-400 mb-6">আপনার লিংক প্রস্তুত। নিচের বাটনে ক্লিক করে গন্তব্যে পৌঁছান।</p>
              
              <button 
                onClick={handleContinueStep2}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-pulse"
              >
                লিংকে প্রবেশ করুন <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Ad Banner Slot */}
      <div className="w-full max-w-2xl h-28 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-xs mt-8 shadow-sm">
        [ Sponsored Promotion Space ]
      </div>

      <p className="text-zinc-500 text-[11px] mt-6 text-center max-w-md">
        XPIG সিকিউর ট্রাফিক গেটওয়ে | Powered by XPIG.me
      </p>
    </div>
  );
}

export default function LinkClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">Loading...</div>}>
      <GatewayContent slug={slug} />
    </Suspense>
  );
}
