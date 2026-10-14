'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
const Player = dynamic(() => import('@/components/video/Player').then((m) => m.Player), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black flex items-center justify-center md:rounded-xl">
      <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
    </div>
  ),
});
import { Heart, Share2, Check, CheckCircle2, Eye, RotateCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import WatchPageSkeleton from '@/components/skeletons/WatchPageSkeleton';
import VideoCard from '@/components/video/VideoCard';
import Pagination from '@/components/ui/Pagination';
import SponsorWatchBanner from '@/components/ads/SponsorWatchBanner';
import { decodeVideoId, encodeVideoId } from '@/lib/obfuscate';
import { FloatingHearts, playDopamineChime } from '@/components/video/FloatingHearts';
import { ShareModal } from '@/components/video/ShareModal';

function formatDuration(duration: any): string {
  if (typeof duration === 'number' && duration > 0) {
    const totalSec = Math.floor(duration);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const h = Math.floor(m / 60);
    if (h > 0) {
      const remM = m % 60;
      return `${h}:${remM < 10 ? '0' : ''}${remM}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
  if (typeof duration === 'string' && duration && duration !== "0" && duration !== "0:00") {
    if (duration.includes(':')) return duration;
    const parsed = parseInt(duration, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const m = Math.floor(parsed / 60);
      const s = parsed % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
  }
  return '';
}

export default function WatchClient({ 
  videoId, 
  initialVideo = null 
}: { 
  videoId: string; 
  initialVideo?: any; 
}) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isAuthenticated, loginWithGoogle } = useAuth();
  
  // Resolve obfuscated video slug (e.g. "v_xxrb9") to raw database ID (e.g. "371")
  const numericId = decodeVideoId(videoId);

  const [videoData, setVideoData] = useState<any>(initialVideo || null);
  const [upNextVideos, setUpNextVideos] = useState<any[]>([]);
  const [suggestedVideos, setSuggestedVideos] = useState<any[]>([]);
  const [suggestionsPage, setSuggestionsPage] = useState<number>(1);
  const [suggestionsTotal, setSuggestionsTotal] = useState<number>(0);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const [watchSponsor, setWatchSponsor] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialVideo);
  const [loadError, setLoadError] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharesCount, setSharesCount] = useState<number>(initialVideo?.shares_count || 0);

  // Auto-collapse sidebar on video open
  useEffect(() => {
    if (!isCollapsed) {
      toggleSidebar();
    }
  }, []);

  // Mark video as watched in localStorage so the NEW badge disappears
  useEffect(() => {
    if (!numericId) return;
    try {
      const watched = JSON.parse(localStorage.getItem('xpig_watched_videos') || '[]');
      const idNum = Number(numericId);
      if (Array.isArray(watched) && !watched.includes(idNum)) {
        watched.push(idNum);
        localStorage.setItem('xpig_watched_videos', JSON.stringify(watched));
      }
    } catch (e) {}
  }, [numericId]);

  // Read guest like status from localStorage
  useEffect(() => {
    if (!numericId) return;
    try {
      const likedList = JSON.parse(localStorage.getItem('xpig_liked_videos') || '[]');
      if (Array.isArray(likedList) && likedList.includes(Number(numericId))) {
        setIsLiked(true);
      }
    } catch (e) {}
  }, [numericId]);

  const fetchSuggestions = async (page: number) => {
    setIsSuggestionsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://xpig.onrender.com');
      const res = await fetch(`${apiBase}/api/v1/discover/search?size=36&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.items || []).filter((v: any) => v.id.toString() !== numericId);
        setSuggestedVideos(filtered);
        setSuggestionsTotal(data.total || 0);
        setSuggestionsPage(page);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function fetchVideoWithRetry(id: string, maxRetries = 2) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const vRes = await fetch(`https://xpig.onrender.com/api/v1/videos/${id}`);
          if (vRes.ok) {
            const vData = await vRes.json();
            return vData;
          }
        } catch (e) {
          // Retry on network glitch / cold start
        }
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
        }
      }
      return null;
    }

    async function loadData() {
      if (!initialVideo) {
        setIsLoading(true);
      }
      setLoadError(false);

      try {
        let vData = initialVideo;
        if (!vData && numericId) {
          vData = await fetchVideoWithRetry(numericId, 2);
          if (!isCancelled) {
            if (vData) {
              setVideoData(vData);
              if (typeof vData.shares_count === 'number') {
                setSharesCount(vData.shares_count);
              }
            } else {
              setLoadError(true);
            }
          }
        }

        // Fetch initial full suggested videos catalog (36 videos)
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://xpig.onrender.com');
        try {
          const sRes = await fetch(`${apiBase}/api/v1/discover/search?size=36&page=1`);
          if (sRes.ok && !isCancelled) {
            const sData = await sRes.json();
            const filtered = (sData.items || []).filter((v: any) => v.id.toString() !== numericId);
            setSuggestedVideos(filtered);
            setSuggestionsTotal(sData.total || 0);
            setSuggestionsPage(1);
            setUpNextVideos(filtered.slice(0, 10));
          }
        } catch (e) {}

        // Fetch active sponsor for sidebar
        try {
          const spRes = await fetch(`https://xpig.onrender.com/api/v1/sponsors/`);
          if (spRes.ok && !isCancelled) {
            const spData = await spRes.json();
            if (Array.isArray(spData) && spData.length > 0) {
              setWatchSponsor(spData[0]);
            }
          }
        } catch (e) {}
      } catch (err) {
        console.error('WatchClient loadData error:', err);
        if (!isCancelled && !videoData) {
          setLoadError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [numericId, initialVideo]);
  
  // Real-time Ambient Mode (Safeguarded against CORS SecurityError)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let animationFrameId: number;
    let isTainted = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderAmbient = () => {
      if (!isTainted) {
        try {
          const videoElement = document.querySelector('video') as HTMLVideoElement;
          if (videoElement && !videoElement.paused && !videoElement.ended && videoElement.readyState >= 2) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          }
        } catch (e) {
          isTainted = true;
        }
      }
      animationFrameId = requestAnimationFrame(renderAmbient);
    };

    animationFrameId = requestAnimationFrame(renderAmbient);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoading]);

  // Real-time tracking: mark as watched locally + record view in database immediately
  useEffect(() => {
    if (!numericId) return;

    // 1. Mark as watched in localStorage so "NEW" badge is removed permanently
    try {
      const watched = JSON.parse(localStorage.getItem('xpig_watched_videos') || '[]');
      const idNum = Number(numericId);
      if (Array.isArray(watched) && !watched.includes(idNum)) {
        watched.push(idNum);
        localStorage.setItem('xpig_watched_videos', JSON.stringify(watched));
      }
    } catch (e) {}

    // 2. Send immediate initial view ping to database
    let isMounted = true;
    const recordView = async () => {
      try {
        const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            watch_time: 1,
            is_new_view: true
          })
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (typeof data.views === 'number') {
            setVideoData((prev: any) => prev ? { ...prev, views: data.views } : prev);
          }
        }
      } catch (e) {}
    };

    recordView();

    // 3. Periodic watch time accumulator during active playback
    const interval = setInterval(async () => {
      const videoElement = document.querySelector('video');
      if (videoElement && !videoElement.paused) {
        try {
          await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}/ping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              watch_time: 10,
              is_new_view: false
            })
          });
        } catch (e) {}
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [numericId]);

  // Guest-friendly Love / Heart toggle (persists to localStorage + backend)
  const handleLikeToggle = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);

    // Trigger floating heart bubbles swarm on like
    if (nextLiked) {
      setHeartBurst((prev) => prev + 1);
      playDopamineChime();
    }

    // Save in localStorage for persistent guest session
    try {
      let likedList = JSON.parse(localStorage.getItem('xpig_liked_videos') || '[]');
      if (!Array.isArray(likedList)) likedList = [];
      const idNum = Number(numericId);
      if (nextLiked) {
        if (!likedList.includes(idNum)) likedList.push(idNum);
      } else {
        likedList = likedList.filter((id: number) => id !== idNum);
      }
      localStorage.setItem('xpig_liked_videos', JSON.stringify(likedList));
    } catch (e) {}

    // Optimistically adjust local view
    setVideoData((prev: any) => {
      if (!prev) return prev;
      const currentLikes = prev.likes || 0;
      return {
        ...prev,
        likes: nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
      };
    });

    // Send request to backend
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_liked: nextLiked, action: nextLiked ? 'like' : 'unlike' })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === 'number') {
          setVideoData((prev: any) => prev ? { ...prev, likes: data.likes } : prev);
        }
      }
    } catch (e) {}
  };

  // Track live share count in backend
  const handleShareTrack = async () => {
    setSharesCount((prev) => prev + 1);
    try {
      await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}/share`, {
        method: 'POST'
      });
    } catch (e) {}
  };

  // Open YouTube-style Share Modal
  const handleShare = () => {
    setIsShareOpen(true);
  };

  // Follow (auth gated)
  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      loginWithGoogle();
      return;
    }
    setIsFollowing(!isFollowing);
  };

  if (isLoading) return <WatchPageSkeleton />;

  if (!videoData) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6">
          <RotateCw className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ভিডিওটি লোড করা সম্ভব হয়নি
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          সার্ভারের সাময়িক বিলম্বের কারণে ভিডিও লোড হতে দেরি হচ্ছে। অনুগ্রহ করে নিচে ক্লিক করে পুনরায় চেষ্টা করুন।
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-900/30 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>আবার চেষ্টা করুন (Retry)</span>
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-sm rounded-xl transition-all border border-zinc-700 flex items-center gap-2 active:scale-95"
          >
            <span>হোমপেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  // Dynamically resolve real video stream from Cloudflare R2
  const realVideoUrl = 
    videoData?.sources?.find((s: any) => s.resolution === 'Original')?.source_url || 
    videoData?.sources?.[0]?.source_url || 
    videoData?.video_url || 
    videoData?.preview_url || 
    "";
  
  return (
    <div className="min-h-screen bg-[#181818] md:px-8 text-white pb-28 sm:pb-20 pt-3 md:pt-6">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
        
        {/* Left Col - Video Player & Details */}
        <div className="lg:col-span-2">
          {/* Ambient Mode & Player Wrapper */}
          <div className="relative">
            {/* Static Fallback Glow (Before Play) */}
            {videoData?.thumbnail_url && (
              <div 
                className="absolute -inset-10 blur-[80px] opacity-30 bg-cover bg-center z-0 hidden md:block" 
                style={{ backgroundImage: `url(${videoData.thumbnail_url})` }}
              />
            )}
            {/* Real-time Dynamic Glow */}
            <canvas
              ref={canvasRef}
              width={160}
              height={90}
              className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)] blur-[80px] opacity-60 z-0 hidden md:block pointer-events-none transition-opacity duration-500"
            />
            
            {/* Theatrical Fixed 16:9 Stage (Borderless) */}
            <div className="relative z-10 w-full aspect-video bg-black md:rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <FloatingHearts burstCount={heartBurst} />
              {realVideoUrl ? (
                <Player 
                  src={realVideoUrl}
                  fallbackSrc={videoData?.preview_url || undefined}
                  autoPlay={true} 
                  title={videoData?.title || `Video ${numericId}`} 
                  poster={videoData?.thumbnail_url || undefined}
                  previewUrl={videoData?.preview_url || undefined}
                />
              ) : (
                <div className="aspect-video w-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                  <p className="text-sm font-semibold">Video stream is processing or currently unavailable.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-4 md:px-0">
            <h1 className="text-xl md:text-2xl font-bold mt-4 md:mt-6 leading-tight text-zinc-100">
              {videoData?.title || `Premium Video ${numericId}`}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between mt-4 pb-6 border-b border-zinc-800 gap-4">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-zinc-700/60 to-zinc-900 border border-zinc-500/40 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md shadow-black/40">
                  <Image 
                    src="/pig-logo.png" 
                    alt="xpig" 
                    width={32} 
                    height={32} 
                    className="object-contain" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-white">xpig</h3>
                    {/* Meta Verified Blue Rosette Badge (Flat & Solid, No Glow) */}
                    <Image 
                      src="/verified-badge.png" 
                      alt="Verified Creator" 
                      width={18} 
                      height={18} 
                      className="w-4 h-4 object-contain shrink-0" 
                    />
                  </div>
                  <p className="text-xs text-zinc-400">Official Content Platform</p>
                </div>
                <button 
                  onClick={handleFollowToggle}
                  className={`ml-3 px-5 py-2 rounded-full font-semibold text-xs transition-all ${
                    isFollowing 
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' 
                      : 'bg-white hover:bg-zinc-200 text-black shadow-sm'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Actions: Love Reaction & YouTube-Style Share */}
              <div className="flex items-center gap-2.5">
                {/* Love / Heart Button (Solid, No Glow) */}
                <button 
                  onClick={handleLikeToggle}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold cursor-pointer active:scale-95 ${
                    isLiked 
                      ? 'bg-rose-600 text-white border border-rose-600 shadow-sm' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                  }`}
                  title="Love this video"
                >
                  <Heart className={`w-4 h-4 transition-transform group-hover:scale-115 active:scale-125 ${isLiked ? 'fill-white text-white' : 'text-zinc-400 group-hover:text-rose-400'}`} />
                  <span className="font-bold">{videoData?.likes ?? (isLiked ? 1 : 0)}</span>
                </button>

                {/* YouTube-Style Share Button */}
                <button 
                  onClick={handleShare}
                  className="group flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-full transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
                  title="Share video link"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 fill-current text-zinc-300 group-hover:text-white transition-colors"
                    aria-hidden="true"
                  >
                    <path d="M15 5.63 20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C8.62 9.77 5.25 12.63 3 17.5 5.75 14.5 9.5 13 14 13v6l8-7-8-7z"/>
                  </svg>
                  <span>Share {sharesCount > 0 ? `(${sharesCount})` : ''}</span>
                </button>
              </div>
            </div>
            
            {/* Description & Metadata */}
            <div className="mt-6 bg-[#111] rounded-xl p-4 text-sm text-zinc-300 border border-zinc-800/60">
              <p className="font-semibold text-white mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <span>{videoData?.views || 0} views</span>
                <span>•</span>
                <span>{videoData?.created_at ? new Date(videoData.created_at).toLocaleDateString() : 'Just now'}</span>
              </p>
              <p className="text-zinc-400 leading-relaxed">{videoData?.description || 'No description available for this video.'}</p>
            </div>
          </div>
        </div>

        {/* Right Col - Up Next / Recommended Sidebar */}
        <div className="lg:col-span-1 space-y-4 px-4 md:px-0 mt-6 lg:mt-0">
          {/* Active Sponsor Banner (Only if present in database) */}
          {watchSponsor && <SponsorWatchBanner sponsor={watchSponsor} />}

          <h3 className="text-base font-bold text-zinc-200 tracking-tight">Up Next</h3>
          
          <div className="flex flex-col gap-3">
            {upNextVideos.map((video) => {
              const cardPlayUrl = video.preview_url || video.video_url || video.sources?.[0]?.source_url;
              return (
                <Link 
                  key={video.id} 
                  href={`/watch/${encodeVideoId(video.id)}`}
                  className="flex gap-3 group rounded-[12px] p-1.5 hover:bg-zinc-900/80 transition-colors"
                >
                  <div className="w-32 sm:w-40 aspect-video bg-zinc-900 rounded-[10px] overflow-hidden relative shrink-0 border border-zinc-800/60">
                    {video.thumbnail_url ? (
                      <Image 
                        src={video.thumbnail_url} 
                        alt={video.title} 
                        fill 
                        sizes="(max-width: 640px) 128px, 160px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : cardPlayUrl ? (
                      <video 
                        src={`${cardPlayUrl}#t=4.0`}
                        preload="metadata"
                        muted
                        playsInline
                        className="object-cover w-full h-full pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                        HD VIDEO
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white tracking-wide">
                      {formatDuration(video.duration) || 'HD'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-start py-0.5 overflow-hidden">
                    <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[11px] text-zinc-400 font-medium">xpig</span>
                      <Image 
                        src="/verified-badge.png" 
                        alt="Verified Creator" 
                        width={14} 
                        height={14} 
                        className="w-3.5 h-3.5 object-contain shrink-0" 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {(video.views || 0).toLocaleString()} views
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
      </div>

      {/* Full Width Suggested Videos Catalog with Centered Numbered Pagination */}
      <div id="more-videos-section" className="max-w-[1440px] mx-auto px-4 md:px-0 mt-12 mb-10 pt-8 border-t border-zinc-800/80 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Suggested For You</span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Explore more trending, viral and uncut videos
            </p>
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full self-start sm:self-auto">
            <span>Page {suggestionsPage} of {Math.max(1, Math.ceil(suggestionsTotal / 36))} ({suggestionsTotal.toLocaleString()} videos)</span>
          </div>
        </div>

        {isSuggestionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 opacity-40 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {suggestedVideos.map((video) => (
              <VideoCard key={`sug-${video.id}`} video={video} />
            ))}
          </div>
        )}

        {/* Centered Numbered Pagination (1, 2, 3, 4... Next) */}
        <Pagination 
          currentPage={suggestionsPage}
          totalPages={Math.max(1, Math.ceil(suggestionsTotal / 36))}
          totalItems={suggestionsTotal}
          pageSize={36}
          onPageChange={fetchSuggestions}
        />
      </div>

      {/* YouTube-Style Share Dialog Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={videoData?.title || 'XPIG Video'}
        shareUrl={typeof window !== 'undefined' ? window.location.href : `https://xpig.me/watch/${videoId}`}
        onShareTrack={handleShareTrack}
      />
    </div>
  );
}
