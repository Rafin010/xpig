'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@/components/video/Player';
import { ThumbsUp, Share2, Check, CheckCircle2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import WatchPageSkeleton from '@/components/skeletons/WatchPageSkeleton';
import VideoCard from '@/components/video/VideoCard';
import SponsorWatchBanner from '@/components/ads/SponsorWatchBanner';
import { decodeVideoId, encodeVideoId } from '@/lib/obfuscate';

export default function WatchClient({ videoId }: { videoId: string }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isAuthenticated, loginWithGoogle } = useAuth();
  
  // Resolve obfuscated video slug (e.g. "v_xxrb9") to raw database ID (e.g. "371")
  const numericId = decodeVideoId(videoId);

  const [videoData, setVideoData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [watchSponsor, setWatchSponsor] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

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

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch specific video using decoded numeric ID
        const vRes = await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}`);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVideoData(vData);
        }

        // Fetch related videos
        const relRes = await fetch(`https://xpig.onrender.com/api/v1/discover/search`);
        if (relRes.ok) {
          const rData = await relRes.json();
          // Filter out current video
          setRelatedVideos((rData.items || []).filter((v: any) => v.id.toString() !== numericId));
        }

        // Fetch active sponsor for sidebar
        try {
          const spRes = await fetch(`https://xpig.onrender.com/api/v1/sponsors/`);
          if (spRes.ok) {
            const spData = await spRes.json();
            if (Array.isArray(spData) && spData.length > 0) {
              setWatchSponsor(spData[0]);
            }
          }
        } catch (e) {}
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [numericId]);
  
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

  // Real-time tracking for analytics and views
  useEffect(() => {
    let isFirstPing = true;
    const interval = setInterval(async () => {
      const videoElement = document.querySelector('video');
      if (videoElement && !videoElement.paused) {
        try {
          const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}/ping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              watch_time: 5,
              is_new_view: isFirstPing
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (typeof data.views === 'number') {
              setVideoData((prev: any) => prev ? { ...prev, views: data.views } : prev);
            }
          }
          isFirstPing = false;
        } catch (e) {}
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [numericId]);

  // Guest-friendly Like toggle (persists to localStorage + backend)
  const handleLikeToggle = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);

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

  // One-click Share (native share or clipboard fallback)
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoData?.title || 'XPIG Video',
          url: shareUrl,
        });
        return;
      } catch (e) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch (e) {}
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

  // Dynamically resolve real video stream from Cloudflare R2
  const realVideoUrl = 
    videoData?.sources?.find((s: any) => s.resolution === 'Original')?.source_url || 
    videoData?.sources?.[0]?.source_url || 
    videoData?.video_url || 
    videoData?.preview_url || 
    "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  
  return (
    <div className="min-h-screen bg-black md:px-8 text-white pb-20 pt-4 md:pt-6">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
        
        {/* Left Col - Video Player & Details */}
        <div className="lg:col-span-2">
          {/* Ambient Mode & Player Wrapper */}
          <div className="relative">
            {/* Static Fallback Glow (Before Play) */}
            <div 
              className="absolute -inset-10 blur-[80px] opacity-30 bg-cover bg-center z-0 hidden md:block" 
              style={{ backgroundImage: `url(${videoData?.thumbnail_url || "https://files.vidstack.io/sprite-fight/poster.webp"})` }}
            />
            {/* Real-time Dynamic Glow */}
            <canvas
              ref={canvasRef}
              width={160}
              height={90}
              className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)] blur-[80px] opacity-60 z-0 hidden md:block pointer-events-none transition-opacity duration-500"
            />
            
            {/* Adaptive Player Container */}
            <div className="relative z-10 w-full max-h-[80vh] flex items-center justify-center bg-zinc-950 md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-y border-zinc-800 md:border-x">
              <Player 
                src={realVideoUrl}
                autoPlay={true} 
                title={videoData?.title || `Premium Video ${numericId}`} 
                poster={videoData?.thumbnail_url || "https://files.vidstack.io/sprite-fight/poster.webp"}
              />
            </div>
          </div>
          
          <div className="px-4 md:px-0">
            <h1 className="text-xl md:text-2xl font-bold mt-4 md:mt-6 leading-tight text-zinc-100">
              {videoData?.title || `Premium Video ${numericId}`}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between mt-4 pb-6 border-b border-zinc-800 gap-4">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-zinc-800 border border-zinc-700/80 rounded-full flex items-center justify-center font-bold text-base text-zinc-200 shadow-sm">
                  {videoData?.creator_id ? `C${videoData.creator_id}` : 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Creator {videoData?.creator_id || 'Unknown'}</h3>
                  <p className="text-xs text-zinc-400">0 followers</p>
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

              {/* Actions: Likes & Share */}
              <div className="flex items-center gap-2.5">
                {/* Like Button (Guests Allowed) */}
                <button 
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${
                    isLiked 
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                  title="Like this video"
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                  <span>{videoData?.likes ?? (isLiked ? 1 : 0)}</span>
                </button>

                {/* Share Button (Native / Clipboard) */}
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full transition-all text-sm font-semibold"
                  title="Share video link"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
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
            {relatedVideos.slice(0, 10).map((video) => (
              <Link 
                key={video.id} 
                href={`/watch/${encodeVideoId(video.id)}`}
                className="flex gap-3 group rounded-[12px] p-1.5 hover:bg-zinc-900/80 transition-colors"
              >
                <div className="w-40 aspect-video bg-zinc-900 rounded-[10px] overflow-hidden relative shrink-0 border border-zinc-800/60">
                  {video.thumbnail_url ? (
                    <Image 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      fill 
                      sizes="160px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                      NO THUMBNAIL
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-bold text-white">
                    {video.duration || "0:00"}
                  </div>
                </div>
                
                <div className="flex flex-col justify-start py-0.5 overflow-hidden">
                  <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 truncate">
                    Creator {video.creator_id}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {video.views || 0} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
      </div>

      {/* Full Width Related Videos Section Below */}
      {relatedVideos.length > 10 && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-0 mt-12 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">More Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {relatedVideos.slice(10).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
