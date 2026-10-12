'use client';

import { MediaPlayer, MediaProvider, Poster, Gesture } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

interface PlayerProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  previewUrl?: string;
  title?: string;
  autoPlay?: boolean;
}

export function Player({ src, poster, previewUrl, title, autoPlay = true }: PlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play().catch(() => {});
      } else {
        playerRef.current.pause().catch(() => {});
      }
    }
  };

  // Outside click listener to hide player controls and icons immediately
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (playerRef.current) {
          try {
            // Dismiss controls overlay when clicking outside the player
            if (typeof playerRef.current.remote?.hideControls === 'function') {
              playerRef.current.remote.hideControls();
            }
          } catch (err) {}
        }
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

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

  // Determine thumbnail asset for seekbar hover scrub preview
  const scrubThumbnail = previewUrl || poster;

  // Vidstack requires ThumbnailImageInit[] format to support direct image URLs for seekbar hover scrub preview
  const thumbnailData = scrubThumbnail
    ? [{ url: scrubThumbnail, startTime: 0, endTime: 999999 }]
    : undefined;

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden select-none group flex items-center justify-center"
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
        aspectRatio="16/9"
        controlsDelay={2000}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onFullscreenChange={handleFullscreenChange}
        className="w-full h-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden ring-0 outline-none flex items-center justify-center"
        style={{ '--video-brand': '#db2777' } as any}
      >
        <MediaProvider className="w-full h-full flex items-center justify-center bg-black">
          {poster && (
            <Poster 
              className="vds-poster object-contain w-full h-full bg-black" 
              src={poster} 
              alt={title || "Video thumbnail"} 
            />
          )}
        </MediaProvider>

        {/* Vidstack native debounced gesture controls */}
        <Gesture className="vds-gesture absolute inset-0 z-0" event="pointerup" action="toggle:paused" />
        <Gesture className="vds-gesture absolute inset-0 z-0" event="dblpointerup" action="toggle:fullscreen" />

        {/* XPIG.me Official Single Watermark (Bottom-Right Original Position, 40% Opacity) */}
        <div className="absolute bottom-12 right-3 md:bottom-14 md:right-4 z-20 pointer-events-none select-none opacity-40">
          <img 
            src="/player-watermark.png" 
            alt="XPIG.me" 
            className="h-5 md:h-6.5 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" 
          />
        </div>

        <DefaultVideoLayout 
          noGestures
          icons={defaultLayoutIcons} 
          thumbnails={thumbnailData}
          color="hsl(330, 81%, 60%)" 
        />
      </MediaPlayer>

      {/* Center Glassmorphism Play Button (Only visible when paused) */}
      {!isPlaying && (
        <button
          type="button"
          data-play-toggle="true"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label="Play video"
          className="absolute inset-0 m-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all transform hover:scale-110 active:scale-95 z-20 cursor-pointer pointer-events-auto"
        >
          <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1.5 drop-shadow-md" />
        </button>
      )}
    </div>
  );
}
