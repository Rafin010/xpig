import Image from 'next/image';
'use client';

import { Play, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';

export default function VideoCard({ video }: { video: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const previewTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    previewTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
    setIsHovered(false);
  };

  const isNew = video.created_at && (new Date().getTime() - new Date(video.created_at).getTime()) < 72 * 60 * 60 * 1000;
  
  const playUrl = video.preview_url || video.video_url;

  return (
    <Link 
      href={`/watch/${video.id}`} 
      className="group flex flex-col gap-2 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Box */}
      <div className="aspect-[16/9] bg-[#1a1a1a] rounded-lg overflow-hidden relative border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
        
        {isHovered && playUrl ? (
          <video 
            src={playUrl} 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover scale-105 transition-all duration-700"
          />
        ) : (
          <>
            {video.thumbnail_url ? (
              <Image 
                src={video.thumbnail_url} 
                alt={video.title} 
                className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`} 
              / fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-600 font-bold">NO THUMBNAIL</span>
              </div>
            )}
          </>
        )}

        {/* Glassmorphism Play Icon Removed as per user request */}
        <div className={`absolute inset-0 transition-colors flex items-center justify-center z-10 ${isHovered && !playUrl ? 'bg-black/20' : ''}`}>
        </div>

        {/* NEW Badge */}
        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-pink-600 rounded text-[10px] font-black text-white tracking-widest uppercase z-20 shadow-lg shadow-pink-900/50">
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
      <div className="flex gap-3 mt-1 px-1">
        <div className="w-9 h-9 bg-pink-500 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg">
          {video.creator_id?.toString().slice(0,2) || "U"}
        </div>
        
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-medium text-[15px] text-zinc-100 leading-snug line-clamp-2 group-hover:text-pink-400 transition-colors">
            {video.title}
          </h3>
          
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[13px] text-zinc-400 hover:text-white transition-colors truncate">
              Creator {video.creator_id}
            </span>
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
          </div>

          <div className="flex items-center gap-3 text-[12px] text-zinc-500 mt-0.5 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {video.views || 0}
            </span>
            <span className="flex items-center gap-1 text-green-500/90">
              <ThumbsUp className="w-3.5 h-3.5" />
              {video.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
