'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import VideoCard from './VideoCard';
import AdCard from '../ads/AdCard';
import VideoCardSkeleton from '../skeletons/VideoCardSkeleton';
import { Loader2 } from 'lucide-react';

export default function VideoGrid({ initialVideos = [] }: { initialVideos?: any[] }) {
  const [videos, setVideos] = useState<any[]>(initialVideos);
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const categories = ["All", "Premium", "Verified", "Amateur", "VR", "Couples", "Solo", "Trending", "Exclusive"];

  const fetchVideos = async (pageNum: number, category: string, reset: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const size = 20;
      let url = `https://xpig.onrender.com/api/v1/discover/search?size=${size}&page=${pageNum}`;
      if (category !== "All") url += `&category=${encodeURIComponent(category)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        
        if (reset) {
          setVideos(items);
        } else {
          setVideos(prev => [...prev, ...items]);
        }
        
        if (items.length < size) setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Change category
  const handleCategoryClick = (cat: string) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    setPage(1);
    setHasMore(true);
    fetchVideos(1, cat, true);
  };

  // Infinite Scroll Observer setup
  const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVideos(nextPage, activeCategory, false);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, activeCategory]);

  return (
    <>
      {/* Category Pills */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-white text-black' 
                : 'bg-[#1a1a1a] text-zinc-300 hover:bg-[#2a2a2a] border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">
        {activeCategory === "All" ? "Recommended For You" : `${activeCategory} Videos`}
      </h1>

      {videos.length === 0 && loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(12)].map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : videos.length === 0 && !loading ? (
        <div className="text-zinc-500 flex flex-col items-center justify-center py-20">
          <p>No videos found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video, index) => {
            if (videos.length === index + 1) {
              return (
                <div ref={lastVideoElementRef} key={video.id + '-' + index}>
                  <VideoCard video={video} />
                </div>
              );
            } else {
              return <VideoCard key={video.id + '-' + index} video={video} />;
            }
          })}
        </div>
      )}

      {loading && videos.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      )}
    </>
  );
}
