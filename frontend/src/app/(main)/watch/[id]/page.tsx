import React from 'react';
import type { Metadata } from 'next';
import WatchClient from './WatchClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const video = await res.json();
      return {
        title: `${video.title || 'Video'} - XPIG`,
        description: video.description || 'Watch exclusive premium video content on XPIG.',
        openGraph: {
          title: `${video.title || 'Video'} - XPIG`,
          description: video.description || 'Watch exclusive premium video content on XPIG.',
          images: [video.thumbnail_url || '/og-image.jpg'],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${video.title || 'Video'} - XPIG`,
          description: video.description || 'Watch exclusive premium video content on XPIG.',
          images: [video.thumbnail_url || '/og-image.jpg'],
        },
      };
    }
  } catch {}

  return {
    title: 'Watch Video - XPIG',
    openGraph: {
      images: ['/og-image.jpg'],
    },
    twitter: {
      images: ['/og-image.jpg'],
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <WatchClient videoId={resolvedParams.id} />;
}

export const instant = false;
