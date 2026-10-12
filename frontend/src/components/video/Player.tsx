'use client';

import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface PlayerProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

export function Player({ src, fallbackSrc, poster, title, autoPlay = true }: PlayerProps) {
  const playerRef = useRef<any>(null);
  const videoFallbackRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (useFallback && videoFallbackRef.current) {
      if (videoFallbackRef.current.paused) {
        videoFallbackRef.current.play().catch(() => {});
      } else {
        videoFallbackRef.current.pause();
      }
      return;
    }

    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play().catch(() => {});
      } else {
        playerRef.current.pause().catch(() => {});
      }
    }
  };

  const handleFullscreenChange = (isFullscreen: boolean) => {
    try {
      if (isFullscreen) {
        const orientation = screen.orientation as any;
        if (orientation && orientation.lock) {
          orientation.lock('landscape').catch(() => {});
        }
      } else {
        const orientation = screen.orientation as any;
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
      }
    } catch (err) {}
  };

  if (useFallback) {
    return (
      <div 
        onClick={togglePlay}
        className="relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group"
      >
        <video
          ref={videoFallbackRef}
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          muted={false}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />

        {/* Center Glassmorphism Play Button */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 m-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all transform hover:scale-110 active:scale-95 z-20 cursor-pointer pointer-events-auto"
          >
            <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1.5 drop-shadow-md" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={togglePlay}
      className="relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden cursor-pointer group"
    >
      <MediaPlayer 
        ref={playerRef}
        title={title} 
        src={src} 
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        autoPlay={autoPlay}
        muted={false}
        onError={() => setUseFallback(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onFullscreenChange={handleFullscreenChange}
        className="w-full h-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden ring-0 outline-none"
        style={{ '--video-brand': '#db2777' } as any}
      >
        <MediaProvider>
          {poster && <Poster className="vds-poster object-cover" src={poster} alt={title} />}
        </MediaProvider>
        <DefaultVideoLayout 
          icons={defaultLayoutIcons} 
          thumbnails={poster}
          color="hsl(330, 81%, 60%)" 
        />
      </MediaPlayer>

      {/* Center Glassmorphism Play Button */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 m-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all transform hover:scale-110 active:scale-95 z-20 cursor-pointer pointer-events-auto"
        >
          <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1.5 drop-shadow-md" />
        </button>
      )}
    </div>
  );
}
