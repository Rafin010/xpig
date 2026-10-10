'use client';
import React, { useState } from 'react';
import { Check, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscribeClient({ creatorId }: { creatorId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert("Subscription activated successfully!");
      router.push(`/discover`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 md:px-12 text-white flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Support Creator_{creatorId}</h1>
          <p className="text-zinc-400 text-lg mb-8">
            Get instant access to exclusive 4K content, private messaging, and behind-the-scenes updates.
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-500" />
              <span className="font-medium text-lg">Unlimited Premium Video Access</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-500" />
              <span className="font-medium text-lg">Direct Messaging</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-500" />
              <span className="font-medium text-lg">Cancel Anytime</span>
            </li>
          </ul>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure 128-bit SSL encrypted transaction</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-rose-900/10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Premium Subscription</h2>
            <div className="mt-4 mb-2 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold">$14.99</span>
              <span className="text-zinc-500 font-medium">/ month</span>
            </div>
            <p className="text-sm text-zinc-400">Renews automatically. Cancel anytime.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 flex items-center justify-between cursor-pointer hover:border-rose-500 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-zinc-400" />
                <span className="font-medium">Credit / Debit Card</span>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              </div>
            </div>
            <div className="border border-zinc-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors opacity-60">
              <div className="flex items-center gap-3">
                <span className="font-medium text-zinc-400">Crypto / Paxum</span>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-zinc-600"></div>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            {isProcessing ? 'Processing...' : 'Subscribe Now'}
          </button>
          
          <p className="text-xs text-zinc-500 text-center mt-4">
            By subscribing, you agree to our Terms of Service and Privacy Policy. Payment is processed securely by our trusted billing partners.
          </p>
        </div>
      </div>
    </div>
  );
}
