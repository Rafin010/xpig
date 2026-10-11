'use client';

import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useState, useRef, useEffect } from 'react';

interface PlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

export function Player({ src, poster, title, autoPlay = true }: PlayerProps) {
  const playerRef = useRef<any>(null);
  const videoFallbackRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);

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

  useEffect(() => {
    if (useFallback && videoFallbackRef.current) {
      videoFallbackRef.current.defaultMuted = true;
      videoFallbackRef.current.muted = true;
      videoFallbackRef.current.play().catch(() => {});
    }
  }, [useFallback]);

  if (useFallback) {
    return (
      <div className="w-full h-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden relative flex items-center justify-center">
        <video
          ref={videoFallbackRef}
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          muted={true}
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <MediaPlayer 
      ref={playerRef}
      title={title} 
      src={src} 
      viewType="video"
      streamType="on-demand"
      logLevel="warn"
      playsInline
      autoPlay={autoPlay}
      muted={true}
      onError={() => setUseFallback(true)}
      onFullscreenChange={handleFullscreenChange}
      className="w-full h-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden ring-0 outline-none"
      style={{ '--video-brand': '#db2777' } as any} // Pink-600
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
  );
}
