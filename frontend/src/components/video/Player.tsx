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
 */
function AutoRotateIcon({ className = "w-4 h-4", isRotated = false }: { className?: string; isRotated?: boolean }) {
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

export function Player({ src, fallbackSrc, poster, previewUrl, title, autoPlay = true }: PlayerProps) {
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const seekRafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
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
  }, [src]);

  // Audio track check: detects media files with zero video frames (e.g. voice notes / audio leaks)
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
      }
    }
  }, [fallbackSrc, currentSrc]);

  useEffect(() => {
    if (!mounted) return;
    let count = 0;
    const interval = setInterval(() => {
      checkMediaTracks();
      count++;
      if (count > 20) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
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

  const toggleRotate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const nextRotated = !isRotated;
    setIsRotated(nextRotated);

    const container = containerRef.current;
    const orientation = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;

    if (nextRotated) {
      // 1. Enter Fullscreen (required by mobile browsers to allow orientation lock)
      try {
        const isAlreadyFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
        if (!isAlreadyFs) {
          if (container && container.requestFullscreen) {
            await container.requestFullscreen().catch(() => {});
          } else if (container && (container as any).webkitRequestFullscreen) {
            await (container as any).webkitRequestFullscreen().catch(() => {});
          } else if (playerRef.current?.remote?.enterFullscreen) {
            await playerRef.current.remote.enterFullscreen().catch(() => {});
          }
        }
      } catch (err) {}

      // 2. Lock screen orientation to landscape
      try {
        if (orientation && orientation.lock) {
          await orientation.lock('landscape').catch(() => {});
        } else if ((screen as any).lockOrientation) {
          (screen as any).lockOrientation('landscape');
        }
      } catch (err) {}
    } else {
      // Revert from landscape back to portrait
      try {
        if (orientation && orientation.unlock) {
          orientation.unlock();
        } else if (orientation && orientation.lock) {
          await orientation.lock('portrait').catch(() => {});
        }
      } catch (err) {}

      try {
        const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
        if (isFs) {
          if (document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen().catch(() => {});
          } else if (playerRef.current?.remote?.exitFullscreen) {
            await playerRef.current.remote.exitFullscreen().catch(() => {});
          }
        }
      } catch (err) {}
    }
  };

  const handleFullscreenChange = (isFullscreen: boolean) => {
    try {
      const orientation = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
      if (isFullscreen) {
        if (orientation && orientation.lock) {
          orientation.lock('landscape').catch(() => {});
        }
        setIsRotated(true);
      } else {
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
        setIsRotated(false);
      }
    } catch (err) {}
  };

  if (!mounted) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden flex items-center justify-center">
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
  const isCssRotated = isRotated && isScreenPortrait;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden select-none group flex items-center justify-center transition-[transform,width,height] duration-300 ${
        isCssRotated
          ? '!fixed !inset-0 !z-[99999] !w-[100vh] !h-[100vw] !max-w-none !max-h-none !rounded-none !shadow-none'
          : ''
      }`}
      style={
        isCssRotated
          ? {
              transform: 'rotate(90deg) translateY(-100%)',
              transformOrigin: 'top left',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vh',
              height: '100vw',
              zIndex: 99999,
            }
          : undefined
      }
    >
      <MediaPlayer 
        ref={playerRef}
        title={title} 
        src={currentSrc} 
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        autoPlay={autoPlay}
        muted={false}
        loop={isLooping}
        aspectRatio="16/9"
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

        <DefaultVideoLayout 
          noGestures
          icons={defaultLayoutIcons} 
          color="hsl(330, 81%, 60%)" 
        />
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

      {/* Top-Right Control Cluster: Audio Switch + Professional Mobile Auto-Rotate */}
      <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-2 pointer-events-auto">
        {/* Floating switch button when playing fallback video clip */}
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

        {/* Mobile & Tablet Professional Auto Rotate Button */}
        <button
          type="button"
          onClick={toggleRotate}
          aria-label={isRotated ? "Exit Landscape Rotation" : "Auto Rotate Video"}
          className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 shadow-xl border cursor-pointer select-none ${
            isRotated
              ? 'bg-pink-600/95 text-white border-pink-300/60 shadow-pink-900/50 ring-2 ring-pink-500/40'
              : 'bg-black/70 hover:bg-black/90 text-zinc-100 hover:text-white border-white/25 hover:border-white/40'
          }`}
          title={isRotated ? "Exit Landscape Rotation" : "Auto Rotate Player"}
        >
          <AutoRotateIcon className={`w-4 h-4 transition-transform duration-300 ${isRotated ? 'text-white' : 'text-pink-400'}`} isRotated={isRotated} />
          <span className="text-[11px] font-bold tracking-tight">
            {isRotated ? 'ল্যান্ডস্কেপ' : 'রোটেট'}
          </span>
        </button>
      </div>

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
