'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, ChevronDown, ChevronUp, ShieldCheck, Video, Tag } from 'lucide-react';
import { POPULAR_SEARCH_PILLS, BANGLA_SCRIPT_KEYWORDS, BANGLISH_AND_ENGLISH_KEYWORDS } from '@/lib/seo-keywords';

export function SeoContent() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section 
      aria-label="SEO and Popular Video Categories"
      className="mt-14 mb-8 pt-8 border-t border-zinc-800/80 text-zinc-400"
    >
      {/* 1. Trending Keyword Tag Cloud */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-pink-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            জনপ্রিয় সার্চ ও ট্রেন্ডিং টপিক (Trending Searches)
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCH_PILLS.map((pill) => (
            <Link
              key={pill.label}
              href={`/?q=${encodeURIComponent(pill.query)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#111113] hover:bg-zinc-800 border border-zinc-800/90 text-zinc-300 hover:text-white hover:border-pink-500/40 transition-all shadow-sm group"
            >
              <Tag className="w-3 h-3 text-zinc-500 group-hover:text-pink-400 transition-colors" />
              <span>{pill.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Structured SEO Text Block (Expandable) */}
      <div className="bg-[#0b0b0d] border border-zinc-800/60 rounded-2xl p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-bold text-zinc-100">
              XPIG.me — আপনার পছন্দের সেরা দেশি ও বাংলা ভিডিও কালেকশন
            </h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors self-start sm:self-auto"
          >
            <span>{isExpanded ? 'সংক্ষিপ্ত করুন (Show Less)' : 'বিস্তারিত পড়ুন (Read More)'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
          <strong className="text-white">XPIG.me</strong> হলো সেরা কোয়ালিটির দেশি ও বাংলা অ্যাডাল্ট ভিডিও, ভাইরাল ভিডিও লিংক এবং ১৮+ ভিডিও স্ট্রিমিং প্ল্যাটফর্ম। এখানে আপনারা পাবেন প্রতিদিনের আপডেটেড দেশি ভাইরাল ভিডিও (Deshi viral videos), বাংলা সেক্স ভিডিও (Bangla sex videos), বাংলাদেশি ভিডিও কালেকশন এবং প্রিমিয়াম এইচডি কনটেন্ট সম্পূর্ণ বিনামূল্যে ও বাফারিং-হীন স্ট্রিমিং সুবিধায়।
        </p>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-400 animate-fadeIn">
            <div>
              <h3 className="font-semibold text-zinc-200 mb-1 text-sm">
                কেন XPIG.me আপনার সেরা পছন্দ?
              </h3>
              <p>
                আমাদের প্ল্যাটফর্মে রয়েছে আল্ট্রা-ফাস্ট ক্লাউডফ্লেয়ার R2 ব্যাকড স্ট্রিমিং টেকনোলজি। মোবাইল, ট্যাবলেট কিংবা কম্পিউটার—যেকোনো ডিভাইসে হাই ডেফিনিশন (Full HD 1080p) ভিডিও উপভোগ করুন কোনো ঝামেলা ছাড়াই। প্রতিদিন নতুন নতুন বাংলা অ্যাডাল্ট ভিডিও কালেকশন, ভাইরাল ক্লিপস এবং ট্রেন্ডিং লিংক নিয়মিত আপডেট করা হয়।
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-zinc-200 mb-1 text-sm">
                জনপ্রিয় ক্যাটাগরি ও কালেকশন সমূহ:
              </h3>
              <p>
                দেশি ভাবি ভিডিও, স্টুডেন্ট ও টিচার ভাইরাল ক্লিপস, বাংলা ১৮ প্লাস বিনোদন, বাংলাদেশি ভাইরাল লিংক এবং দেশি কাপলদের আকর্ষণীয় কনটেন্ট সহ বিশাল সংগ্রহশালা।
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-1.5">
              {[...BANGLA_SCRIPT_KEYWORDS.slice(0, 15), ...BANGLISH_AND_ENGLISH_KEYWORDS.slice(0, 15)].map((kw) => (
                <span
                  key={kw}
                  className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500"
                >
                  #{kw}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-500 border-t border-zinc-900">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                ১৮+ প্রাপ্তবয়স্কদের জন্য সংরক্ষিত। সকল কনটেন্ট কপিরাইট ও DMCA পলিসি অনুযায়ী পরিচালিত।
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
