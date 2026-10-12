'use client';

import React, { useEffect, useState } from 'react';

export interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number; // percentage from left
  size: number; // pixel size
  speed: number; // seconds
  drift: number; // horizontal drift px
  rotation: number; // rotation deg
}

interface FloatingHeartsProps {
  burstCount?: number;
}

const EMOJI_PALETTE = [
  '❤️', '💖', '💕', '💜', '💙', '🔥', 
  '😍', '💘', '💓', '💋', '🧡', '💛', '✨'
];

/**
 * Native Web Audio API Dopamine Release Chime (Zero latency, pleasant harmonic pop)
 */
export function playDopamineChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {}
}

export function FloatingHearts({ burstCount = 0 }: FloatingHeartsProps) {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    if (burstCount <= 0) return;

    // Generate a rich shower of 18-24 floating multi-colored emojis from bottom to top
    const newEmojis: FloatingEmoji[] = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      emoji: EMOJI_PALETTE[Math.floor(Math.random() * EMOJI_PALETTE.length)],
      x: 10 + Math.random() * 80, // spread across 10% to 90% of screen width
      size: Math.floor(Math.random() * 16) + 24, // 24px to 40px
      speed: 1.6 + Math.random() * 0.9, // 1.6s to 2.5s duration
      drift: (Math.random() - 0.5) * 120, // -60px to +60px drift
      rotation: (Math.random() - 0.5) * 45, // -22deg to +22deg
    }));

    setEmojis((prev) => [...prev, ...newEmojis]);

    const timer = setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => !newEmojis.some((ne) => ne.id === e.id)));
    }, 2800);

    return () => clearTimeout(timer);
  }, [burstCount]);

  if (emojis.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {emojis.map((e) => (
        <span
          key={e.id}
          className="fixed select-none animate-screen-emoji pointer-events-none"
          style={{
            left: `${e.x}%`,
            bottom: 0,
            fontSize: `${e.size}px`,
            animationDuration: `${e.speed}s`,
            ['--drift' as any]: `${e.drift}px`,
            ['--rot' as any]: `${e.rotation}deg`,
          }}
        >
          {e.emoji}
        </span>
      ))}
    </div>
  );
}
