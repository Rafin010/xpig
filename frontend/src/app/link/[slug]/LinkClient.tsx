'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';

function GatewayContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const step = searchParams.get('step') || '1';
  
  const [timeLeft, setTimeLeft] = useState(5);
  const [canProceed, setCanProceed] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Example Adsterra Direct Link (Replace with actual)
  const adDirectLink = "https://www.example.com/ad-monetization-link";

  useEffect(() => {
    // Fetch destination from API
    fetch(`https://xpig.onrender.com/api/v1/links/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Link not found');
        return res.json();
      })
      .then(data => {
        setDestination(data.destination_url);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (step === '1' && !loading && !error) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setCanProceed(true);
      }
    } else if (step === '2') {
      // For step 2, button is active immediately
      setCanProceed(true);
    }
  }, [timeLeft, step, loading, error]);

  const handleContinueStep1 = () => {
    // Open Ad in new tab
    window.open(adDirectLink, '_blank');
    // Go to step 2
    router.push(`/link/${slug}?step=2`);
  };

  const handleContinueStep2 = async () => {
    // Trigger ad one last time
    window.open(adDirectLink, '_blank');

    // Register click on backend
    try {
      await fetch(`https://xpig.onrender.com/api/v1/links/${slug}/click`, { method: 'POST' });
    } catch (e) {
      console.error('Click tracking failed');
    }

    // Go to actual destination
    if (destination) {
      window.location.href = destination;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
          <p className="font-medium">Securing connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Link</h1>
          <p className="text-slate-500">The link you are trying to access does not exist or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 font-sans">
      
      {/* Top Ad Banner Slot */}
      <div className="w-full max-w-3xl h-24 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 mb-8 shadow-sm">
        [ Top Banner Ad ]
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-pink-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">XPIG Link Gateway</h1>
          <p className="text-pink-100 mt-1">Your secure link is being prepared</p>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          
          {step === '1' ? (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Step 1 of 2</h2>
              <p className="text-slate-500 mb-8">Please wait while we verify your connection. This helps us prevent bots and spam.</p>
              
              {!canProceed ? (
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-black text-pink-600 mb-2">{timeLeft}</div>
                  <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Seconds Remaining</p>
                </div>
              ) : (
                <button 
                  onClick={handleContinueStep1}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Final Step!</h2>
              <p className="text-slate-500 mb-8">Your destination is ready. Click the button below to join the channel/group.</p>
              
              <button 
                onClick={handleContinueStep2}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-transform hover:scale-105 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 animate-pulse"
              >
                Get Link <ExternalLink className="w-5 h-5" />
              </button>
            </>
          )}

        </div>
      </div>

      {/* Bottom Ad Banner Slot */}
      <div className="w-full max-w-3xl h-32 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 mt-8 shadow-sm">
        [ Bottom Banner Ad / Native Ad Widget ]
      </div>

      {/* Footer text to make it look legit */}
      <p className="text-slate-400 text-xs mt-8 text-center max-w-md">
        By continuing, you agree to our Terms of Service. This is a sponsored gateway.
      </p>

    </div>
  );
}

export default function LinkClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <GatewayContent slug={slug} />
    </Suspense>
  );
}


