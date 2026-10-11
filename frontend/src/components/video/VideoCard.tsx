'use client';
import Image from 'next/image';
import { Play, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { encodeVideoId } from '@/lib/obfuscate';

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
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[11px] font-bold text-white z-20 flex items-center gap-1 backdrop-blur-sm">
            {video.duration || "0:00"}
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
            {/* Meta Verified Blue Rosette Badge */}
            <svg 
              className="w-3.5 h-3.5 text-[#0095F6] fill-[#0095F6] shrink-0 drop-shadow-[0_0_6px_rgba(0,149,246,0.35)]" 
              viewBox="0 0 24 24"
            >
              <title>Verified Creator</title>
              <path d="M10.5 2.2c.8-.5 1.8-.5 2.6 0l1.4.9c.5.3 1.1.4 1.7.3l1.7-.3c1-.2 1.9.3 2.4 1.2l.8 1.5c.3.5.7.9 1.3 1.1l1.6.5c1 .3 1.6 1.2 1.6 2.2v1.7c0 .6.3 1.2.7 1.6l1.2 1.2c.7.7.7 1.9 0 2.6l-1.2 1.2c-.4.4-.7 1-.7 1.6v1.7c0 1-.6 1.9-1.6 2.2l-1.6.5c-.6.2-1 .6-1.3 1.1l-.8 1.5c-.5.9-1.4 1.4-2.4 1.2l-1.7-.3c-.6-.1-1.2 0-1.7.3l-1.4.9c-.8.5-1.8.5-2.6 0l-1.4-.9c-.5-.3-1.1-.4-1.7-.3l-1.7.3c-1 .2-1.9-.3-2.4-1.2l-.8-1.5c-.3-.5-.7-.9-1.3-1.1l-1.6-.5c-1-.3-1.6-1.2-1.6-2.2v-1.7c0-.6-.3-1.2-.7-1.6l-1.2-1.2c-.7-.7-.7-1.9 0-2.6l1.2-1.2c.4-.4.7-1 .7-1.6v-1.7c0-1 .6-1.9 1.6-2.2l1.6-.5c.6-.2 1-.6 1.3-1.1l.8-1.5c.5-.9 1.4-1.4 2.4-1.2l1.7.3c.6.1 1.2 0 1.7-.3l1.4-.9z"/>
              <path d="M9.5 12.5l2 2 4.5-4.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
