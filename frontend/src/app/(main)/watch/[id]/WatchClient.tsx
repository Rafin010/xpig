'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@/components/video/Player';
import { ThumbsUp, MessageSquare, Share2, Heart, PlayCircle, CheckCircle2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/context/SidebarContext';
import WatchPageSkeleton from '@/components/skeletons/WatchPageSkeleton';
import AdCard from '@/components/ads/AdCard';
import VideoCard from '@/components/video/VideoCard';
import { decodeVideoId } from '@/lib/obfuscate';

export default function WatchClient({ videoId }: { videoId: string }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  // Resolve obfuscated video slug (e.g. "v_xxrb9") to raw database ID (e.g. "371")
  const numericId = decodeVideoId(videoId);

  const [videoData, setVideoData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch specific video using decoded numeric ID
        const vRes = await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}`);
        if (vRes.ok) {
          setVideoData(await vRes.json());
        }

        // Fetch related videos
        const relRes = await fetch(`https://xpig.onrender.com/api/v1/discover/search`);
        if (relRes.ok) {
          const rData = await relRes.json();
          // Filter out current video
          setRelatedVideos((rData.items || []).filter((v: any) => v.id.toString() !== numericId));
        }
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

  // Real-time tracking for analytics
  useEffect(() => {
    let isFirstPing = true;
    const interval = setInterval(async () => {
      const videoElement = document.querySelector('video');
      if (videoElement && !videoElement.paused) {
        try {
          await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}/ping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              watch_time: 5,
              is_new_view: isFirstPing
            })
          });
          isFirstPing = false;
        } catch (e) {}
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [numericId]);

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
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
        
        {/* Left Col - Video & Details & Related */}
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
            <h1 className="text-xl md:text-2xl font-bold mt-4 md:mt-6 leading-tight">{videoData?.title || `Premium Video ${numericId}`}</h1>
            <div className="flex flex-wrap items-center justify-between mt-4 pb-6 border-b border-zinc-800 gap-4">
            
            {/* Creator Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center font-bold text-xl">
                {videoData?.creator_id ? `C${videoData.creator_id}` : 'U'}
              </div>
              <div>
                <h3 className="font-medium text-lg">Creator {videoData?.creator_id || 'Unknown'}</h3>
                <p className="text-sm text-zinc-400">0 followers</p>
              </div>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`ml-4 px-6 py-2 rounded-full font-medium transition-colors ${
                  isFollowing ? 'bg-zinc-800 text-white' : 'bg-pink-500 hover:bg-pink-400 text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  isLiked ? 'bg-pink-500/20 text-pink-400' : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{isLiked ? (videoData?.likes || 0) + 1 : (videoData?.likes || 0)}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="mt-6 bg-[#111] rounded-xl p-4 text-sm text-zinc-300">
            <p className="font-medium text-white mb-2">{videoData?.views || 0} views • {videoData?.created_at ? new Date(videoData.created_at).toLocaleDateString() : 'Just now'}</p>
            <p>{videoData?.description || 'No description available for this video.'}</p>
          </div>

          </div> {/* End Mobile Padding Wrapper */}
        </div>

        {/* Right Col - Ads & Sponsored */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Ad Banner 1 */}
          <a href="#" className="block w-full h-64 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden relative group">
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-zinc-400 font-bold z-10">ADVERTISEMENT</div>
            <img src="https://source.unsplash.com/koy6FlCCy5s/400x400" alt="Ad" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <h4 className="text-xl font-bold text-white mb-1">Play Free 18+ Games</h4>
              <p className="text-xs text-pink-400 font-bold">NO CREDIT CARD REQUIRED</p>
            </div>
          </a>

          {/* Sponsored Videos */}
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Sponsored Videos</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Link href="#" key={i} className="flex gap-3 group">
                  <div className="w-32 aspect-video bg-zinc-900 rounded-md overflow-hidden relative shrink-0">
                    <img src={`https://source.unsplash.com/random/300x200?model&sig=${i}`} alt="Sponsored" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[9px] font-bold">10:05</div>
                  </div>
                  <div className="flex flex-col justify-between py-0.5">
                    <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 group-hover:text-pink-400 transition-colors">Exclusive Premium Content - Watch Now</h4>
                    <span className="text-[10px] text-zinc-500">Sponsored</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Ad Banner 2 */}
          <a href="#" className="block w-full h-32 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden relative group">
            <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-zinc-400 font-bold z-10">AD</div>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/40 to-purple-900/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <h4 className="text-lg font-bold text-white drop-shadow-md">Meet Local Singles</h4>
              <button className="mt-2 bg-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">Sign Up Free</button>
            </div>
          </a>

        </div>
        
      </div>

      {/* Full Width Related Videos Section */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-0">
        {/* Related Videos Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Related Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6">
            <AdCard key="ad1" />
            <AdCard key="ad2" />
            {relatedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
