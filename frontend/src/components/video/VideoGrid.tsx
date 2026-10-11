'use client';

import VideoCard from './VideoCard';
import SponsorCard from '../ads/SponsorCard';
import Link from 'next/link';

export default function VideoGrid({ 
  videos = [], 
  sponsors = [],
  activeCategory = "All" 
}: { 
  videos?: any[]; 
  sponsors?: any[];
  activeCategory?: string;
}) {
  const categories = ["All", "Premium", "Verified", "Amateur", "VR", "Couples", "Solo", "Trending", "Exclusive"];

  // Interleave sponsors only if real active sponsors are present
  const combinedItems: { type: 'video' | 'sponsor'; data: any; key: string }[] = [];
  
  let sponsorIndex = 0;
  videos.forEach((video, index) => {
    // If active sponsors exist, insert at index 3 and index 7
    if (sponsors.length > sponsorIndex && (index === 3 || index === 7)) {
      const sp = sponsors[sponsorIndex++];
      combinedItems.push({ type: 'sponsor', data: sp, key: `sponsor-${sp.id}` });
    }
    combinedItems.push({ type: 'video', data: video, key: `video-${video.id}-${index}` });
  });

  return (
    <>
      {/* Category Pills */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const href = cat === "All" ? "/" : `/?category=${encodeURIComponent(cat)}`;
          return (
            <Link 
              key={cat} 
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-white text-black font-bold shadow-md shadow-white/10' 
                  : 'bg-[#1a1a1a] text-zinc-300 hover:bg-[#2a2a2a] border border-zinc-800'
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">
        {activeCategory === "All" ? "Recommended For You" : `${activeCategory} Videos`}
      </h1>

      {videos.length === 0 ? (
        <div className="text-zinc-500 flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold">No videos found for this page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {combinedItems.map((item) => (
            item.type === 'sponsor' ? (
              <SponsorCard key={item.key} sponsor={item.data} />
            ) : (
              <VideoCard key={item.key} video={item.data} />
            )
          ))}
        </div>
      )}
    </>
  );
}
