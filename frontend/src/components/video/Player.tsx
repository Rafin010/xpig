'use client';

import { MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useEffect, useRef } from 'react';

interface PlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

export function Player({ src, poster, title, autoPlay = true }: PlayerProps) {
  const playerRef = useRef<any>(null);

  const handleFullscreenChange = (isFullscreen: boolean) => {
    try {
      if (isFullscreen) {
        const orientation = screen.orientation as any;
        if (orientation && orientation.lock) {
          orientation.lock('landscape').catch((e: any) => console.log('Orientation lock not supported', e));
        }
      } else {
        const orientation = screen.orientation as any;
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
      }
    } catch (err) {
      console.log('Screen orientation API error', err);
    }
  };

  return (
    <MediaPlayer 
      ref={playerRef}
      title={title} 
      src={src} 
      viewType="video"
      streamType="on-demand"
      logLevel="warn"
      crossOrigin
      playsInline
      autoPlay={autoPlay}
      muted={true}
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
