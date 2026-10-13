'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoCard from './VideoCard';
import SponsorCard from '../ads/SponsorCard';
import SponsorBanner from '../ads/SponsorBanner';
import Link from 'next/link';

export default function VideoGrid({ 
  videos: initialVideos = [], 
  sponsors = [],
  activeCategory = "All",
  totalVideos = 371
}: { 
  videos?: any[]; 
  sponsors?: any[];
  activeCategory?: string;
  totalVideos?: number;
}) {
  const categories = ["All", "Hot", "Deshi", "Bangla", "Viral", "Trending", "Couples", "HD", "Premium", "Exclusive"];

  // Unique session seed generated once per browser visit/refresh
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 900000) + 100000);

  // Infinite Scroll state
  const [videoList, setVideoList] = useState<any[]>(initialVideos);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Synchronize when initialVideos or activeCategory changes from SSR
  useEffect(() => {
    setVideoList(initialVideos);
    setPage(1);
    setHasMore(initialVideos.length < (totalVideos || 371));
    setIsLoadingMore(false);
  }, [initialVideos, activeCategory, totalVideos]);

  // Load next page of videos dynamically
  const loadMoreVideos = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://xpig.onrender.com');
      let url = `${apiBase}/api/v1/discover/search?size=24&page=${nextPage}&seed=${sessionSeed}`;
      if (activeCategory && activeCategory !== 'All') {
        url += `&category=${encodeURIComponent(activeCategory)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newItems = data.items || [];

        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setVideoList((prev) => {
            const existingIds = new Set(prev.map((v: any) => v.id));
            const filtered = newItems.filter((v: any) => !existingIds.has(v.id));
            if (filtered.length === 0) {
              setHasMore(false);
              return prev;
            }
            const updated = [...prev, ...filtered];
            if (updated.length >= (data.total || totalVideos || 371)) {
              setHasMore(false);
            }
            return updated;
          });
          setPage(nextPage);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more videos:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, sessionSeed, activeCategory, totalVideos]);

  // IntersectionObserver for auto-triggering infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { rootMargin: '500px' } // Pre-load 500px before user hits bottom for smooth experience
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore, loadMoreVideos]);

  const bannerSponsors = sponsors.filter((s: any) => s.is_active !== false && (s.placement === 'banner' || s.placement === 'all'));
  const feedSponsors = sponsors.filter((s: any) => s.is_active !== false && (s.placement === 'feed' || s.placement === 'all' || !s.placement));

  // Determine Slot 1 (at index 3) and Slot 2 (at index 7)
  const playlistCandidates = feedSponsors.filter((s: any) => s.in_card_playlist !== false);

  const fixedSlot1 = feedSponsors.find((s: any) => s.is_fixed_slot && s.fixed_slot_position === 1);
  const slot1Sponsor = fixedSlot1 || playlistCandidates.find((s: any) => !s.is_fixed_slot || s.fixed_slot_position === 1);

  const fixedSlot2 = feedSponsors.find((s: any) => s.is_fixed_slot && s.fixed_slot_position === 2);
  const slot2Sponsor = fixedSlot2 || playlistCandidates.find((s: any) => 
    s.id !== slot1Sponsor?.id && (!s.is_fixed_slot || s.fixed_slot_position === 2)
  );

  // Interleave feed sponsors into video stream
  const combinedItems: { type: 'video' | 'sponsor'; data: any; key: string }[] = [];
  
  videoList.forEach((video, index) => {
    if (index === 3 && slot1Sponsor) {
      combinedItems.push({ type: 'sponsor', data: slot1Sponsor, key: `sponsor-slot1-${slot1Sponsor.id}` });
    }
    if (index === 7 && slot2Sponsor) {
      combinedItems.push({ type: 'sponsor', data: slot2Sponsor, key: `sponsor-slot2-${slot2Sponsor.id}` });
    }
    combinedItems.push({ type: 'video', data: video, key: `video-${video.id}-${index}` });
  });

  return (
    <>
      {/* Category Pills */}
      <div className="flex items-center gap-2 sm:gap-2.5 mb-5 sm:mb-7 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar touch-pan-x -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const href = cat === "All" ? "/" : `/?category=${encodeURIComponent(cat)}`;
          return (
            <Link 
              key={cat} 
              href={href}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-white text-black font-bold shadow-md shadow-white/10' 
                  : 'bg-[#18181b] text-zinc-300 hover:bg-[#27272a] hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Top Billboard Sponsor Banner */}
      {bannerSponsors.length > 0 && (
        <SponsorBanner sponsor={bannerSponsors[0]} />
      )}

      {/* Heading */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-2.5">
          <span>{activeCategory === "All" ? "Recommended For You" : `${activeCategory} Videos`}</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </h1>
        <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
          <span>{videoList.length} of {totalVideos || 371} videos</span>
        </div>
      </div>

      {/* Empty State */}
      {videoList.length === 0 && !isLoadingMore ? (
        <div className="text-zinc-500 flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold">No videos found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-6 sm:gap-y-8">
          {combinedItems.map((item) => (
            item.type === 'sponsor' ? (
              <SponsorCard key={item.key} sponsor={item.data} />
            ) : (
              <VideoCard key={item.key} video={item.data} />
            )
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-6 w-full" />

      {/* Loading Spinner Indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8 gap-3 text-zinc-400 animate-in fade-in duration-200">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-zinc-300">আরো লাইভ ভিডিও লোড হচ্ছে...</span>
        </div>
      )}

      {/* All Videos Explored Completion Banner */}
      {!hasMore && videoList.length > 0 && (
        <div className="text-center py-10 border-t border-zinc-800/80 mt-10">
          <p className="text-xs text-zinc-400 font-semibold flex items-center justify-center gap-1.5">
            <span>🎉 আপনি ডাটাবেজের সমস্ত {videoList.length}টি লাইভ ভিডিও এক্সপ্লোর করেছেন!</span>
          </p>
        </div>
      )}
    </>
  );
}
