'use client';

import React, { useEffect, useState } from 'react';

export interface FloatingHeart {
  id: number;
  x: number; // percentage from left (e.g. 50-90%)
  size: number; // pixel size 18-36
  color: string;
  speed: number; // animation duration in seconds 1.2-2.0
  drift: number; // horizontal drift px
  rotation: number; // rotation deg
}

interface FloatingHeartsProps {
  burstCount?: number;
}

const HEART_COLORS = [
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#db2777', // pink-600
  '#e11d48', // rose-600
  '#a855f7', // purple-500
  '#f472b6', // pink-400
  '#fb7185', // rose-400
];

export function FloatingHearts({ burstCount = 0 }: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    if (burstCount <= 0) return;

    // Generate a fresh burst of 12-16 floating hearts
    const newHearts: FloatingHeart[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      // Spawn near the bottom right / bottom center of the player
      x: 75 + (Math.random() * 20 - 10), // 65% to 85% from left
      size: Math.floor(Math.random() * 16) + 18, // 18px to 34px
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      speed: 1.2 + Math.random() * 0.8, // 1.2s to 2.0s
      drift: (Math.random() - 0.5) * 80, // -40px to +40px horizontal drift
      rotation: (Math.random() - 0.5) * 50, // -25deg to +25deg
    }));

    setHearts((prev) => [...prev, ...newHearts]);

    // Cleanup after animation completes
    const timer = setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 2200);

    return () => clearTimeout(timer);
  }, [burstCount]);

  if (hearts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-6 select-none animate-float-heart"
          style={{
            left: `${h.x}%`,
            fontSize: `${h.size}px`,
            color: h.color,
            filter: `drop-shadow(0 2px 8px ${h.color}80)`,
            animationDuration: `${h.speed}s`,
            ['--drift' as any]: `${h.drift}px`,
            ['--rot' as any]: `${h.rotation}deg`,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
