'use client';

import VideoCard from './VideoCard';
import SponsorCard from '../ads/SponsorCard';
import SponsorBanner from '../ads/SponsorBanner';
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

  const bannerSponsors = sponsors.filter((s: any) => s.is_active !== false && (s.placement === 'banner' || s.placement === 'all'));
  const feedSponsors = sponsors.filter((s: any) => s.is_active !== false && (s.placement === 'feed' || s.placement === 'all' || !s.placement));

  // Determine Slot 1 (at index 3) and Slot 2 (at index 7)
  const playlistCandidates = feedSponsors.filter((s: any) => s.in_card_playlist !== false);

  // Slot 1: Fixed slot 1 priority, then first playlist candidate
  const fixedSlot1 = feedSponsors.find((s: any) => s.is_fixed_slot && s.fixed_slot_position === 1);
  const slot1Sponsor = fixedSlot1 || playlistCandidates.find((s: any) => !s.is_fixed_slot || s.fixed_slot_position === 1);

  // Slot 2: Fixed slot 2 priority, then next distinct playlist candidate
  const fixedSlot2 = feedSponsors.find((s: any) => s.is_fixed_slot && s.fixed_slot_position === 2);
  const slot2Sponsor = fixedSlot2 || playlistCandidates.find((s: any) => 
    s.id !== slot1Sponsor?.id && (!s.is_fixed_slot || s.fixed_slot_position === 2)
  );

  // Interleave feed sponsors only if real active sponsors are present
  const combinedItems: { type: 'video' | 'sponsor'; data: any; key: string }[] = [];
  
  videos.forEach((video, index) => {
    // Slot 1 at index 3
    if (index === 3 && slot1Sponsor) {
      combinedItems.push({ type: 'sponsor', data: slot1Sponsor, key: `sponsor-slot1-${slot1Sponsor.id}` });
    }
    // Slot 2 at index 7
    if (index === 7 && slot2Sponsor) {
      combinedItems.push({ type: 'sponsor', data: slot2Sponsor, key: `sponsor-slot2-${slot2Sponsor.id}` });
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

      {/* Top Billboard Sponsor Banner (Only rendered if active banner sponsor exists) */}
      {bannerSponsors.length > 0 && (
        <SponsorBanner sponsor={bannerSponsors[0]} />
      )}

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
