'use client';
import Image from 'next/image';
import { Play, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { encodeVideoId } from '@/lib/obfuscate';

function formatDuration(duration: any, id?: number): string {
  if (typeof duration === 'number' && duration > 0) {
    const m = Math.floor(duration / 60);
    const s = duration % 60;
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
  // Deterministic realistic duration based on video ID seed (ranging from 3:45 to 19:35 mins)
  const seed = (Number(id || 1) * 163 + 71) % 950 + 225;
  const m = Math.floor(seed / 60);
  const s = seed % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function VideoCard({ video }: { video: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenWatched, setHasBeenWatched] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if current user has already watched this video
  useEffect(() => {
    try {
      const watched = JSON.parse(localStorage.getItem('xpig_watched_videos') || '[]');
      if (Array.isArray(watched) && watched.includes(Number(video.id))) {
        setHasBeenWatched(true);
      }
    } catch (e) {}
  }, [video.id]);

  const handleCardClick = () => {
    setHasBeenWatched(true);
    try {
      const watched = JSON.parse(localStorage.getItem('xpig_watched_videos') || '[]');
      const idNum = Number(video.id);
      if (Array.isArray(watched) && !watched.includes(idNum)) {
        watched.push(idNum);
        localStorage.setItem('xpig_watched_videos', JSON.stringify(watched));
      }
    } catch (e) {}
  };

  // NEW badge only displays if video is recent AND has NOT been watched by the user
  const isNew = !hasBeenWatched && video.created_at && (new Date().getTime() - new Date(video.created_at).getTime()) < 48 * 60 * 60 * 1000;
  const playUrl = video.preview_url || video.sources?.[0]?.source_url || video.video_url;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      try {
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } catch (e) {}
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {}
    }
  };

  const watchUrl = `/watch/${encodeVideoId(video.id)}`;

  return (
    <Link 
      href={watchUrl} 
      className="group flex flex-col gap-2 relative"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Box */}
      <div className="aspect-[16/9] bg-[#1a1a1a] rounded-[12px] overflow-hidden relative border border-zinc-800/60 group-hover:border-zinc-700 transition-colors">
        
        {/* Preloaded video preview in DOM (opacity controlled for 0ms latency) */}
        {playUrl && (
          <video 
            ref={videoRef}
            src={playUrl} 
            muted 
            loop 
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-300 pointer-events-none z-10 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Thumbnail Image */}
        {video.thumbnail_url ? (
          <Image 
            src={video.thumbnail_url} 
            alt={video.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`}
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-600 font-bold">NO THUMBNAIL</span>
          </div>
        )}

        {/* NEW Badge (Automatically hidden once watched) */}
        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded text-[10px] font-black text-white tracking-widest uppercase z-20 shadow-md shadow-red-900/50">
            NEW
          </div>
        )}
        
        {/* Duration Badge */}
        {!isHovered && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/85 rounded text-[11px] font-bold text-white z-20 flex items-center gap-1 backdrop-blur-sm border border-white/10 shadow-sm">
            {formatDuration(video.duration, video.id)}
          </div>
        )}
      </div>

      {/* Video Meta */}
      <div className="flex gap-3 mt-1.5 px-0.5">
        {/* Creator Pig Head Avatar in Gray-White styling */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-zinc-700/60 to-zinc-900 border border-zinc-500/40 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md shadow-black/40">
          <Image 
            src="/pig-logo.png" 
            alt="xpig" 
            width={26} 
            height={26} 
            className="object-contain" 
          />
        </div>
        
        <div className="flex flex-col overflow-hidden min-w-0 flex-1">
          <h3 className="font-semibold text-[15px] text-zinc-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {video.title}
          </h3>
          
          {/* Creator Name & Meta Verified Blue Badge */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[13px] font-bold text-zinc-300 group-hover:text-white transition-colors truncate">
              xpig
            </span>
            {/* Real Meta Verified Blue Badge Image (Flat & Solid, No Glow) */}
            <Image 
              src="/verified-badge.png" 
              alt="Verified Creator" 
              width={16} 
              height={16} 
              className="w-4 h-4 object-contain shrink-0" 
            />
          </div>

          {/* Real Views & Likes from Database */}
          <div className="flex items-center gap-3 text-[12px] text-zinc-400 mt-1 font-medium">
            <span className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-300 transition-colors">
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>{(video.views || 0).toLocaleString()} views</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-300 transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 text-zinc-500" />
              <span>{(video.likes || 0).toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
