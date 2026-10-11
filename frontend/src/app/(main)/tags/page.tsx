import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, Home, ChevronRight, Layers, Flame, Globe } from 'lucide-react';
import {
  TARGET_TAG_PAGES,
  BANGLA_SCRIPT_KEYWORDS,
  HINDI_SCRIPT_KEYWORDS,
  BANGLISH_AND_ENGLISH_KEYWORDS,
  slugifyKeyword,
} from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: 'সব ক্যাটাগরি ও ট্রেন্ডিং ট্যাগস - XPIG.me Video Tags Directory',
  description:
    'XPIG.me এর সব বাংলা ও দেশি অ্যাডাল্ট ভিডিও ক্যাটাগরি, ট্রেন্ডিং ট্যাগস এবং ভাইরাল সার্চ ডিরেক্টরি। Explore all Bangla sex videos, Deshi viral clips, and 18+ categories.',
  alternates: {
    canonical: 'https://xpig.me/tags',
  },
  openGraph: {
    title: 'সব ক্যাটাগরি ও ট্রেন্ডিং ট্যাগস - XPIG.me',
    description:
      'XPIG.me এর সব বাংলা ও দেশি অ্যাডাল্ট ভিডিও ক্যাটাগরি এবং ট্রেন্ডিং ট্যাগ ডিরেক্টরি।',
    url: 'https://xpig.me/tags',
  },
};

export default function TagsDirectoryPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://xpig.me',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tags Directory',
        item: 'https://xpig.me/tags',
      },
    ],
  };

  return (
    <div className="w-full h-full px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-28 sm:pb-20 bg-[#050505] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>হোম</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-zinc-300 font-semibold">ট্যাগস ডিরেক্টরি</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-[#0b0b0d] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Layers className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ভিডিও ক্যাটাগরি ও ট্রেন্ডিং ট্যাগস ডিরেক্টরি
          </h1>
        </div>
        <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
          আপনার পছন্দের যেকোনো ক্যাটাগরি বা টপিক সহজে খুঁজে পেতে নিচের ট্যাগগুলো এক্সপ্লোর করুন। প্রতিদিনের নতুন ভাইরাল ভিডিও, দেশি কালেকশন এবং প্রিমিয়াম ১৮+ কনটেন্ট সরাসরি অ্যাক্সেস করুন।
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Featured Programmatic Landing Pages */}
        <div className="bg-[#0b0b0d] border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-bold text-white">টপ সার্চড ল্যান্ডিং পেইজ (Featured Tags)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TARGET_TAG_PAGES.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-pink-500/40 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 transition-colors shrink-0" />
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                    {tag.name}
                  </span>
                </div>
                <span className="text-[10px] text-pink-400 font-bold ml-2">HD</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 2: Bangla Script Keywords */}
        <div className="bg-[#0b0b0d] border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">বাংলা ক্যাটাগরি ও কালেকশন (Bengali Topics)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {BANGLA_SCRIPT_KEYWORDS.map((kw) => {
              const slug = slugifyKeyword(kw);
              return (
                <Link
                  key={kw}
                  href={`/tag/${slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-colors"
                >
                  #{kw}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 3: English / Banglish Queries */}
        <div className="bg-[#0b0b0d] border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Deshi & Bangla Viral Queries</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {BANGLISH_AND_ENGLISH_KEYWORDS.map((kw) => {
              const slug = slugifyKeyword(kw);
              return (
                <Link
                  key={kw}
                  href={`/tag/${slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-colors"
                >
                  {kw}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 4: Hindi Script Topics */}
        <div className="bg-[#0b0b0d] border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Hindi & Indian Categories (हिंदी)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {HINDI_SCRIPT_KEYWORDS.map((kw) => {
              const slug = slugifyKeyword(kw);
              return (
                <Link
                  key={kw}
                  href={`/tag/${slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-colors"
                >
                  #{kw}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
