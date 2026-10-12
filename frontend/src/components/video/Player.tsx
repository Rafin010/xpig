'use client';

import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useState, useRef, useEffect } from 'react';
import { Volume2, Disc, Film, Sparkles, RefreshCw } from 'lucide-react';

interface PlayerProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

export function Player({ src, fallbackSrc, poster, title, autoPlay = true }: PlayerProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const playerRef = useRef<any>(null);
  const videoFallbackRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('16 / 9');
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);

  // Sync currentSrc if src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsAudioOnly(false);
  }, [src]);

  const handleMetadata = (e: any) => {
    try {
      const target = (e?.target || e?.detail?.target) as HTMLVideoElement;
      if (target) {
        if (target.videoWidth && target.videoHeight && target.videoWidth > 0 && target.videoHeight > 0) {
          setAspectRatio(`${target.videoWidth} / ${target.videoHeight}`);
          setIsAudioOnly(false);
        } else {
          // No video frames detected in current stream
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            console.log('[Player] No video track on primary stream, switching to visual preview:', fallbackSrc);
            setCurrentSrc(fallbackSrc);
            setIsAudioOnly(false);
          } else {
            setIsAudioOnly(true);
            setAspectRatio('16 / 9');
          }
        }
      }
    } catch (err) {}
  };

  const handlePlayState = (playing: boolean) => {
    setIsPlaying(playing);
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

  useEffect(() => {
    if (useFallback && videoFallbackRef.current) {
      videoFallbackRef.current.defaultMuted = true;
      videoFallbackRef.current.muted = true;
      videoFallbackRef.current.play().catch(() => {});
    }
  }, [useFallback]);

  const toggleStreamSource = () => {
    if (fallbackSrc) {
      if (currentSrc === src) {
        setCurrentSrc(fallbackSrc);
        setIsAudioOnly(false);
      } else {
        setCurrentSrc(src);
      }
    }
  };

  // Audio Equalizer Waveform Bars component with video poster background
  const AudioWaveVisualizer = () => {
    const bars = [40, 75, 25, 90, 60, 30, 85, 45, 95, 70, 35, 80, 50, 100, 65, 30, 85, 40, 90, 60, 25, 75, 50, 85];
    return (
      <div 
        className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 pointer-events-none bg-cover bg-center"
        style={poster ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.88)), url(${poster})` } : { backgroundColor: '#09090b' }}
      >
        {/* Glow circle */}
        <div className="absolute w-64 h-64 bg-pink-600/15 rounded-full blur-3xl animate-pulse" />
        
        {/* Disc / Tape Icon */}
        <div className="relative mb-4">
          <div className={`w-20 h-20 rounded-full bg-zinc-900/90 border-2 border-pink-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)] ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
            <Disc className="w-10 h-10 text-pink-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-pink-600 text-white font-mono font-bold text-[10px] uppercase rounded-full shadow-md flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> Audio Track
          </div>
        </div>

        {/* Audio Title */}
        <h3 className="text-white font-bold text-base md:text-lg text-center max-w-md line-clamp-1 mb-1 drop-shadow-md">
          {title || "Audio Track / Voice Recording"}
        </h3>
        <p className="text-zinc-300 text-xs mb-4 flex items-center gap-1.5 drop-shadow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Audio Track Playing • Visual Waveform Active
        </p>

        {/* Dynamic Animated Equalizer Bars */}
        <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-sm px-4">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-pink-600 to-rose-400 rounded-full transition-all duration-300"
              style={{
                height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '15%',
                animation: isPlaying ? `pulse ${(i % 5) * 0.2 + 0.4}s ease-in-out infinite alternate` : 'none',
              }}
            />
          ))}
        </div>

        {/* Stream Toggle Switcher if visual clip exists */}
        {fallbackSrc && (
          <div className="mt-5 pointer-events-auto">
            <button
              onClick={toggleStreamSource}
              className="px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-600/70 rounded-xl text-xs font-bold text-white transition-all shadow-xl flex items-center gap-2 active:scale-95 hover:border-pink-500"
            >
              <Film className="w-3.5 h-3.5 text-pink-400" />
              <span>{currentSrc === src ? 'Switch to Video Clip (Visual)' : 'Switch to Full Audio'}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const isLooping = currentSrc === fallbackSrc;

  if (useFallback) {
    return (
      <div 
        className="w-full bg-black rounded-none md:rounded-xl overflow-hidden relative flex items-center justify-center mx-auto"
        style={{ aspectRatio, maxHeight: '78vh' }}
      >
        {isAudioOnly && <AudioWaveVisualizer />}
        {fallbackSrc && (
          <button
            onClick={toggleStreamSource}
            className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md border border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg transition-all active:scale-95 hover:border-pink-500/60"
          >
            {currentSrc === fallbackSrc ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Full Audio</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>Video Clip</span>
              </>
            )}
          </button>
        )}
        <video
          ref={videoFallbackRef}
          src={currentSrc}
          poster={poster}
          controls
          autoPlay={autoPlay}
          muted={true}
          loop={isLooping}
          playsInline
          onLoadedMetadata={handleMetadata}
          onPlay={() => handlePlayState(true)}
          onPause={() => handlePlayState(false)}
          className="w-full h-full max-h-[78vh] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-none md:rounded-xl bg-black">
      {isAudioOnly && <AudioWaveVisualizer />}
      {fallbackSrc && (
        <button
          onClick={toggleStreamSource}
          className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md border border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg transition-all active:scale-95 hover:border-pink-500/60"
        >
          {currentSrc === fallbackSrc ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Full Audio</span>
            </>
          ) : (
            <>
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video Clip</span>
            </>
          )}
        </button>
      )}
      <MediaPlayer 
        ref={playerRef}
        title={title} 
        src={currentSrc} 
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        autoPlay={autoPlay}
        muted={true}
        loop={isLooping}
        onError={() => setUseFallback(true)}
        onPlay={() => handlePlayState(true)}
        onPause={() => handlePlayState(false)}
        onFullscreenChange={handleFullscreenChange}
        className="w-full bg-black rounded-none md:rounded-xl overflow-hidden ring-0 outline-none mx-auto"
        style={{ '--video-brand': '#ffffff', aspectRatio, maxHeight: '78vh' } as any}
      >
        <MediaProvider onLoadedMetadata={handleMetadata}>
          {poster && !isAudioOnly && (
            <Poster className="vds-poster object-cover" src={poster} alt={title} />
          )}
        </MediaProvider>
        <DefaultVideoLayout 
          icons={defaultLayoutIcons} 
          color="hsl(0, 0%, 95%)" 
        />
      </MediaPlayer>
    </div>
  );
}
