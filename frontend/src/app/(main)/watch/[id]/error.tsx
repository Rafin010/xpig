'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCw, Home, AlertCircle } from 'lucide-react';

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Watch Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
        ভিডিওটি লোড করা সম্ভব হয়নি
      </h2>
      <p className="text-zinc-400 text-sm max-w-md mb-8">
        সার্ভারের অস্থায়ী সমস্যা বা সংযোগ বিচ্ছিন্নতার কারণে পৃষ্ঠাটি লোড হতে পারেনি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-900/30 flex items-center gap-2 active:scale-95"
        >
          <RotateCw className="w-4 h-4" />
          <span>আবার চেষ্টা করুন (Retry)</span>
        </button>

        <Link
          href="/"
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-sm rounded-xl transition-all border border-zinc-700 flex items-center gap-2 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>হোমপেজে ফিরে যান</span>
        </Link>
      </div>
    </div>
  );
}
