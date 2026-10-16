'use client';

import { MediaPlayer, MediaProvider, Poster, Gesture } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Volume2, Film, RotateCw } from 'lucide-react';

interface PlayerProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  previewUrl?: string;
  title?: string;
  autoPlay?: boolean;
  onFrameDetected?: (isVertical: boolean, ratio: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const totalSec = Math.floor(seconds);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const h = Math.floor(m / 60);
  if (h > 0) {
    const remM = m % 60;
    return `${h}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Professional Auto-Rotate SVG Icon with animated rotating phone and dual orbiting arrows.
 * Adapts icon display when playing vertical (reels) vs widescreen (YouTube) videos.
 */
function AutoRotateIcon({ className = "w-4 h-4", isRotated = false, isVertical = false }: { className?: string; isRotated?: boolean; isVertical?: boolean }) {
  if (isVertical) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        aria-hidden="true"
      >
        {/* Upright Phone with Portrait Fullscreen Expand Arrows */}
        <rect x="7" y="3" width="10" height="18" rx="2" strokeWidth="1.8" className={isRotated ? "stroke-pink-400" : ""} />
        <line x1="10.5" y1="5.5" x2="13.5" y2="5.5" strokeWidth="1.5" />
        <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
        <polyline points="3 7 3 3 7 3" strokeWidth="1.8" />
        <polyline points="21 17 21 21 17 21" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      aria-hidden="true"
    >
      {/* Central Phone Device that tilts/rotates smoothly */}
      <rect 
        x="6.5" 
        y="4" 
        width="11" 
        height="16" 
        rx="2.5" 
        strokeWidth="1.8"
        className={`transition-transform duration-300 origin-center ${isRotated ? 'rotate-90' : ''}`}
      />
      {/* Speaker Bar & Home Button */}
      <line x1="10.5" y1="6.5" x2="13.5" y2="6.5" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      
      {/* Dual Curved Orbiting Arrows */}
      <path d="M20.5 9A8 8 0 0 0 12 3.2" strokeWidth="1.8" />
      <polyline points="21 5 20.5 9 16.5 9" strokeWidth="1.8" />
      
      <path d="M3.5 15A8 8 0 0 0 12 20.8" strokeWidth="1.8" />
      <polyline points="3 19 3.5 15 7.5 15" strokeWidth="1.8" />
    </svg>
  );
}

export function Player({ src, fallbackSrc, poster, previewUrl, title, autoPlay = true, onFrameDetected }: PlayerProps) {
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const seekRafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [videoRatio, setVideoRatio] = useState<number>(16 / 9);
  const [isScreenPortrait, setIsScreenPortrait] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{
    visible: boolean;
    x: number;
    time: number;
  }>({
    visible: false,
    x: 0,
    time: 0,
  });

  // Client-only mount guard to prevent Next.js SSR Maverick context initialization mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal source when prop src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsAudioOnly(false);
    setIsVertical(false);
  }, [src]);

  // Audio track check & dynamic video aspect ratio detection (e.g. 9:16 vertical reels vs 16:9 YouTube)
  const checkMediaTracks = useCallback(() => {
    if (!containerRef.current) return;
    const videoEl = containerRef.current.querySelector('media-player video') as HTMLVideoElement;
    if (videoEl && videoEl.readyState >= 1) {
      if (videoEl.videoWidth === 0 && videoEl.videoHeight === 0) {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          // Auto-switch to visual video clip immediately so user sees the video
          setCurrentSrc(fallbackSrc);
          setIsAudioOnly(false);
        } else {
          setIsAudioOnly(true);
        }
      } else if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        setIsAudioOnly(false);
        const w = videoEl.videoWidth;
        const h = videoEl.videoHeight;
        const ratio = w / h;
        // ratio < 0.95 means vertical / reels style (e.g. 9:16 = 0.5625, 4:5 = 0.8)
        const isVert = ratio < 0.95;
        setIsVertical(isVert);
        setVideoRatio(ratio);
        onFrameDetected?.(isVert, ratio);
      }
    }
  }, [fallbackSrc, currentSrc, onFrameDetected]);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    let cleanupListeners: (() => void) | undefined;
    const attachListeners = () => {
      const videoEl = container.querySelector('media-player video') as HTMLVideoElement;
      if (videoEl) {
        const handleMeta = () => {
          checkMediaTracks();
        };
        videoEl.addEventListener('loadedmetadata', handleMeta);
        videoEl.addEventListener('canplay', handleMeta);
        videoEl.addEventListener('playing', handleMeta);
        cleanupListeners = () => {
          videoEl.removeEventListener('loadedmetadata', handleMeta);
          videoEl.removeEventListener('canplay', handleMeta);
          videoEl.removeEventListener('playing', handleMeta);
        };
      }
    };

    attachListeners();

    let count = 0;
    const interval = setInterval(() => {
      checkMediaTracks();
      count++;
      if (count > 25) clearInterval(interval);
    }, 200);

    return () => {
      if (cleanupListeners) cleanupListeners();
      clearInterval(interval);
    };
  }, [currentSrc, mounted, checkMediaTracks]);

  // Real-time YouTube-style frame scrubber on seekbar hover
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      const slider = container.querySelector('media-time-slider') || container.querySelector('.vds-time-slider');
      if (!slider) {
        setHoverPreview(prev => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const sliderRect = slider.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if pointer is vertically within the seekbar track area
      const isNearSliderY = e.clientY >= sliderRect.top - 30 && e.clientY <= sliderRect.bottom + 25;
      const isWithinSliderX = e.clientX >= sliderRect.left && e.clientX <= sliderRect.right;

      if (!isNearSliderY || !isWithinSliderX) {
        setHoverPreview(prev => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const percent = Math.max(0, Math.min(1, (e.clientX - sliderRect.left) / sliderRect.width));
      const duration = playerRef.current?.duration || 0;
      const targetTime = percent * duration;

      const relX = e.clientX - containerRect.left;
      // Clamp thumbnail (106px wide -> half width = 53px + padding) so it stays inside container boundaries
      const clampedX = Math.max(58, Math.min(containerRect.width - 58, relX));

      setHoverPreview({
        visible: true,
        x: clampedX,
        time: targetTime,
      });

      // Scrub the preview video element in real time
      if (previewVideoRef.current && isFinite(targetTime) && targetTime >= 0) {
        if (!seekRafRef.current) {
          seekRafRef.current = requestAnimationFrame(() => {
            if (previewVideoRef.current) {
              previewVideoRef.current.currentTime = targetTime;
            }
            seekRafRef.current = null;
          });
        }
      }
    };

    const handlePointerLeave = () => {
      setHoverPreview(prev => (prev.visible ? { ...prev, visible: false } : prev));
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      if (seekRafRef.current) {
        cancelAnimationFrame(seekRafRef.current);
      }
    };
  }, [currentSrc, mounted]);

  const toggleStreamSource = () => {
    if (!fallbackSrc) return;
    if (currentSrc === src) {
      setCurrentSrc(fallbackSrc);
      setIsAudioOnly(false);
    } else {
      setCurrentSrc(src);
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play().catch(() => {});
      } else {
        playerRef.current.pause().catch(() => {});
      }
    }
  };

  // Outside click listener to hide player controls immediately
  useEffect(() => {
    if (!mounted) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (playerRef.current) {
          try {
            if (typeof playerRef.current.remote?.hideControls === 'function') {
              playerRef.current.remote.hideControls();
            }
          } catch (err) {}
        }
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [mounted]);

  // Track device screen orientation (Portrait vs Landscape)
  useEffect(() => {
    if (!mounted) return;
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsScreenPortrait(window.innerHeight >= window.innerWidth);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [mounted]);

  // Option A: Physical device rotation auto-fullscreen (YouTube mobile web style)
  // When widescreen YouTube-style video is playing and user tilts phone to landscape, auto-enter fullscreen.
  // When user tilts phone back upright, smoothly exit fullscreen. Reels (vertical) videos stay upright!
  useEffect(() => {
    if (!mounted) return;
    const handleDeviceRotate = async () => {
      if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
      const isLandscapeScreen = window.innerWidth > window.innerHeight;

      const player = playerRef.current;
      const isCurrentlyFs = Boolean(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement ||
        player?.state?.fullscreen
      );

      // If YouTube-style widescreen video is actively playing and user tilts phone to landscape:
      if (!isVertical && isPlaying && isLandscapeScreen && !isCurrentlyFs) {
        try {
          if (player && typeof player.enterFullscreen === 'function') {
            await player.enterFullscreen('prefer-media');
          }
          const orientation = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
          if (orientation && typeof orientation.lock === 'function') {
            orientation.lock('landscape').catch(() => {});
          }
          setIsRotated(true);
        } catch (_) {}
      } else if (!isVertical && !isLandscapeScreen && isCurrentlyFs) {
        // If user tilts phone back upright, smoothly exit fullscreen back to inline
        try {
          if (player && typeof player.exitFullscreen === 'function') {
            await player.exitFullscreen();
          } else if (document.exitFullscreen) {
            await document.exitFullscreen();
          }
          setIsRotated(false);
        } catch (_) {}
      }
    };

    window.addEventListener('resize', handleDeviceRotate);
    window.addEventListener('orientationchange', handleDeviceRotate);
    return () => {
      window.removeEventListener('resize', handleDeviceRotate);
      window.removeEventListener('orientationchange', handleDeviceRotate);
    };
  }, [mounted, isVertical, isPlaying]);

  // Fullscreen event listener to sync rotation and unlock orientation on exit
  useEffect(() => {
    if (!mounted) return;
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFs && !isRotated) {
        try {
          const orientation = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
          if (orientation && orientation.unlock) {
            orientation.unlock();
          }
        } catch (e) {}
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [mounted, isRotated]);

  const toggleRotate = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const player = playerRef.current;
    const container = containerRef.current;
    const videoEl = container?.querySelector('video') as HTMLVideoElement | null;
    const orientation = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;

    const isCurrentlyFs = Boolean(
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement ||
      player?.state?.fullscreen
    );

    if (!isCurrentlyFs) {
      // 1. Enter native Fullscreen via MediaPlayer or fallback to Video Element (for iOS)
      try {
        if (player && typeof player.enterFullscreen === 'function') {
          await player.enterFullscreen('prefer-media');
        } else if (videoEl) {
          if (typeof videoEl.requestFullscreen === 'function') {
            await videoEl.requestFullscreen();
          } else if (typeof (videoEl as any).webkitEnterFullscreen === 'function') {
            (videoEl as any).webkitEnterFullscreen();
          }
        }
      } catch (err) {
        try {
          if (videoEl && typeof (videoEl as any).webkitEnterFullscreen === 'function') {
            (videoEl as any).webkitEnterFullscreen();
          } else if (videoEl && typeof videoEl.requestFullscreen === 'function') {
            await videoEl.requestFullscreen();
          }
        } catch (e2) {}
      }

      // 2. Lock screen orientation:
      // Vertical (Reels) -> PORTRAIT (Keep upright, never flip sideways!)
      // Horizontal (YouTube) -> LANDSCAPE (Auto-rotate to widescreen)
      try {
        const targetOrientation = isVertical ? 'portrait' : 'landscape';
        if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock(targetOrientation).catch(() => {});
        } else if (typeof (screen as any).lockOrientation === 'function') {
          (screen as any).lockOrientation(targetOrientation);
        }
      } catch (e) {}

      setIsRotated(true);
    } else {
      // Exit fullscreen & unlock orientation back
      try {
        if (orientation && typeof orientation.unlock === 'function') {
          orientation.unlock();
        } else if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock('portrait').catch(() => {});
        }
      } catch (e) {}

      try {
        if (player && typeof player.exitFullscreen === 'function') {
          await player.exitFullscreen();
        } else if (typeof document.exitFullscreen === 'function') {
          await document.exitFullscreen();
        } else if (typeof (document as any).webkitExitFullscreen === 'function') {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {}

      setIsRotated(false);
    }
  };

  const handleFullscreenChange = (isFullscreen: boolean) => {
    setIsRotated(isFullscreen);
    try {
      const orientation = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
      if (isFullscreen) {
        const targetOrientation = isVertical ? 'portrait' : 'landscape';
        if (orientation && typeof orientation.lock === 'function') {
          orientation.lock(targetOrientation).catch(() => {});
        }
      } else {
        if (orientation && typeof orientation.unlock === 'function') {
          orientation.unlock();
        }
      }
    } catch (err) {}
  };

  if (!mounted) {
    return (
      <div className={`relative w-full bg-black rounded-none md:rounded-xl overflow-hidden flex items-center justify-center ${isVertical ? 'aspect-[9/16] max-h-[78vh] sm:max-h-[82vh] max-w-[420px] mx-auto' : 'aspect-video'}`}>
        {poster ? (
          <img 
            src={poster} 
            alt={title || "Video thumbnail"} 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
        )}
      </div>
    );
  }

  const isLooping = currentSrc === fallbackSrc;
  const previewSource = isAudioOnly && fallbackSrc ? fallbackSrc : (currentSrc || fallbackSrc || '');

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-black rounded-none md:rounded-xl overflow-hidden select-none group flex items-center justify-center transition-all duration-300 ${
        isVertical 
          ? 'aspect-[9/16] max-h-[78vh] sm:max-h-[82vh] max-w-[420px] mx-auto shadow-2xl' 
          : 'aspect-video'
      }`}
    >
      <MediaPlayer 
        ref={playerRef}
        title={title} 
        src={currentSrc} 
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        fullscreenOrientation={isVertical ? 'portrait' : 'landscape'}
        autoPlay={autoPlay}
        muted={false}
        loop={isLooping}
        aspectRatio={isVertical ? '9/16' : '16/9'}
        controlsDelay={2000}
        onPlay={() => {
          setIsPlaying(true);
          checkMediaTracks();
        }}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setIsAudioOnly(false);
          }
        }}
        onPause={() => setIsPlaying(false)}
        onFullscreenChange={handleFullscreenChange}
        className={`w-full h-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black rounded-none md:rounded-xl overflow-hidden ring-0 outline-none flex items-center justify-center relative`}
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

        <DefaultVideoLayout 
          noGestures
          icons={defaultLayoutIcons} 
          color="hsl(330, 81%, 60%)" 
        />

        {/* Floating Top-Right Auto-Rotate Button - Native inside MediaPlayer for inline & fullscreen visibility */}
        <div className="absolute top-3.5 right-3.5 z-40 flex items-center gap-2 pointer-events-auto">
          {fallbackSrc && currentSrc === fallbackSrc && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleStreamSource();
              }}
              className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md border border-pink-500/60 text-[11px] font-bold text-pink-300 hover:text-white flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">🎵 সম্পূর্ণ অডিও</span>
            </button>
          )}

          {/* Mobile & Tablet Auto-Rotate Fullscreen Button (Icon Only) */}
          <button
            type="button"
            onClick={toggleRotate}
            onTouchEnd={(e) => e.stopPropagation()}
            aria-label={isVertical ? "Portrait Fullscreen" : "Auto Rotate Fullscreen"}
            className={`md:hidden w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-90 shadow-2xl border cursor-pointer select-none pointer-events-auto ${
              isRotated
                ? 'bg-pink-600 text-white border-pink-300 shadow-pink-900/50 ring-2 ring-pink-400'
                : 'bg-black/80 hover:bg-black/95 text-zinc-100 hover:text-white border-white/30 hover:border-white/50'
            }`}
            title={isVertical ? "খাড়া ফুলস্ক্রিন (Portrait Fullscreen)" : "অটো রোটেট (Landscape Fullscreen)"}
          >
            <AutoRotateIcon className="w-5 h-5 text-white" isRotated={isRotated} isVertical={isVertical} />
          </button>
        </div>
      </MediaPlayer>

      {/* Audio-Only Visualizer Overlay - Positioned above MediaPlayer inside containerRef */}
      {isAudioOnly && (
        <div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 md:p-6 select-none pointer-events-none bg-zinc-950 overflow-hidden"
        >
          {/* Blurred Backdrop Poster */}
          {poster && (
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-40 transition-opacity duration-700"
              style={{ backgroundImage: `url(${poster})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/85" />

          {/* Glowing sound wave pulse */}
          <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-pink-600/15 rounded-full blur-3xl animate-pulse" />

          {/* Spinning Disc / Cover Vinyl */}
          <div className="relative mb-3 flex items-center justify-center">
            <div 
              className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-zinc-900/90 border-2 border-pink-500/40 shadow-[0_0_35px_rgba(236,72,153,0.35)] flex items-center justify-center ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}
            >
              {poster ? (
                <img 
                  src={poster} 
                  alt="Audio Cover" 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <Volume2 className="w-10 h-10 text-pink-500" />
              )}
              {/* Center vinyl hole */}
              <div className="absolute w-5 h-5 rounded-full bg-black border-2 border-zinc-700" />
            </div>
            
            <div className="absolute -bottom-2 px-2.5 py-0.5 bg-pink-600 text-white font-mono font-bold text-[10px] uppercase rounded-full shadow-lg flex items-center gap-1 border border-white/20">
              <Volume2 className="w-3 h-3 animate-pulse" /> অডিও রেকর্ড
            </div>
          </div>

          {/* Title & Status */}
          <h3 className="relative z-10 text-white font-bold text-sm md:text-base text-center max-w-md line-clamp-1 mb-1 drop-shadow-md">
            {title || "অডিও রেকর্ড • Audio Recording"}
          </h3>
          <p className="relative z-10 text-zinc-300 text-xs mb-3 flex items-center gap-1.5 drop-shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isPlaying ? 'অডিও চলছে • Audio Playing' : 'পজ করা আছে • Paused'}
          </p>

          {/* Dynamic Equalizer Bars */}
          <div className="relative z-10 flex items-end justify-center gap-1 md:gap-1.5 h-8 md:h-10 w-full max-w-xs px-2">
            {[40, 75, 25, 90, 60, 30, 85, 45, 95, 70, 35, 80, 50, 100, 65, 30, 85, 40, 90, 60, 25, 75, 50, 85].map((h, i) => (
              <div
                key={i}
                className="w-1 md:w-1.5 bg-gradient-to-t from-pink-600 via-rose-500 to-amber-300 rounded-full transition-all duration-200"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * ((i % 4) + 1.2)) % 100)}%` : '15%',
                  animation: isPlaying ? `pulse ${(i % 6) * 0.15 + 0.35}s ease-in-out infinite alternate` : 'none',
                }}
              />
            ))}
          </div>

          {/* Video preview switch button if fallback exists */}
          {fallbackSrc && (
            <div className="relative z-20 mt-3 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStreamSource();
                }}
                className="px-3.5 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-pink-500/50 hover:border-pink-500 rounded-full text-[11px] font-bold text-pink-300 hover:text-white transition-all shadow-xl flex items-center gap-1.5 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Film className="w-3.5 h-3.5 text-pink-400" />
                <span>🎥 ভিডিও ক্লিপ দেখুন (Watch Video Clip)</span>
              </button>
            </div>
          )}
        </div>
      )}


      {/* Real-time YouTube-Style Compact Video Frame Scrubber Tooltip - Positioned in containerRef */}
      {hoverPreview.visible && (
        <div 
          className="absolute bottom-11 md:bottom-14 z-30 pointer-events-none flex flex-col items-center select-none transition-all duration-75"
          style={{ left: `${hoverPreview.x}px`, transform: 'translateX(-50%)' }}
        >
          {/* YouTube-style Ultra-Compact (106px x 60px) Frame Window */}
          <div className="w-[106px] h-[60px] bg-black rounded border border-white/30 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.9)] relative flex items-center justify-center">
            {previewSource ? (
              <video
                ref={previewVideoRef}
                src={previewSource}
                preload="auto"
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : null}
            {/* Fallback to poster if audio only without video clip */}
            {isAudioOnly && !fallbackSrc && poster && (
              <img 
                src={poster} 
                alt="Thumbnail" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            )}
          </div>

          {/* YouTube Timestamp Pill */}
          <div className="mt-1 px-1.5 py-0.5 rounded bg-black/95 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white shadow-md text-center">
            {formatTime(hoverPreview.time)}
          </div>
        </div>
      )}

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
