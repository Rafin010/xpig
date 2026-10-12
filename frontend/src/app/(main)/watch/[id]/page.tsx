import React from 'react';
import type { Metadata } from 'next';
import WatchClient from './WatchClient';
import { decodeVideoId } from '@/lib/obfuscate';

function formatIsoDuration(dur: any): string {
  if (!dur || dur === 0) return "PT5M00S";
  const num = typeof dur === 'number' ? dur : parseInt(String(dur), 10);
  if (!isNaN(num) && num > 0) {
    const m = Math.floor(num / 60);
    const s = num % 60;
    return `PT${m}M${s}S`;
  }
  const str = String(dur);
  if (str.includes(':')) {
    const parts = str.split(':');
    return `PT${parts[0]}M${parts[1] || '00'}S`;
  }
  return "PT5M00S";
}

async function fetchVideoData(id: string) {
  try {
    const numericId = decodeVideoId(id);
    if (!numericId) return null;
    const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${numericId}`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Non-blocking: WatchClient handles client-side loading gracefully
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const video = await fetchVideoData(id);

  if (video) {
    const title = `${video.title || 'Exclusive Video'} - Bangla & Deshi Viral Video | XPIG.me`;
    const description = `${video.title || 'Exclusive Video'} - সেরা বাংলা ও দেশি ভাইরাল ভিডিও কালেকশন on XPIG.me. Watch in Full HD 1080p high quality streaming. নতুন নতুন ভাইরাল লিংক ও দেশি অ্যাডাল্ট ভিডিও।`;
    const videoUrl = `https://xpig.me/watch/${id}`;
    const thumbUrl = video.thumbnail_url || 'https://xpig.me/og-image.jpg';

    return {
      title,
      description,
      keywords: [
        video.title || 'viral video',
        'deshi bhabi sex video',
        'Bangla sex video',
        'Deshi viral video',
        'Bangla viral video links',
        'Desi xxx video',
        'বাংলা অ্যাডাল্ট ভিডিও',
        'দেশি ১৮+ ভিডিও',
        'XPIG.me',
        'XPIG videos'
      ],
      alternates: {
        canonical: videoUrl,
      },
      openGraph: {
        title,
        description,
        url: videoUrl,
        siteName: 'XPIG',
        type: 'video.other',
        images: [
          {
            url: thumbUrl,
            width: 1280,
            height: 720,
            alt: video.title || 'XPIG Video',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [thumbUrl],
      },
    };
  }

  return {
    title: 'Watch Deshi & Bangla Viral Videos - XPIG.me',
    description: 'সেরা দেশি ও বাংলা ভাইরাল ভিডিও কালেকশন on XPIG.me. Watch exclusive 1080p adult streaming.',
    openGraph: {
      images: ['https://xpig.me/og-image.jpg'],
    },
    twitter: {
      images: ['https://xpig.me/og-image.jpg'],
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const video = await fetchVideoData(resolvedParams.id);

  // Schema.org VideoObject for Google Video SERP rich snippets
  const videoSchema = video ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title || "XPIG Viral Video",
    "description": video.description || `${video.title || 'Video'} - Watch exclusive Bangla and Deshi adult video collection on XPIG.me.`,
    "thumbnailUrl": [video.thumbnail_url || "https://xpig.me/og-image.jpg"],
    "uploadDate": video.created_at || new Date().toISOString(),
    "duration": formatIsoDuration(video.duration),
    "contentUrl": video.sources?.[0]?.source_url || video.video_url || "",
    "embedUrl": `https://xpig.me/watch/${resolvedParams.id}`,
    "publisher": {
      "@type": "Organization",
      "name": "XPIG",
      "logo": {
        "@type": "ImageObject",
        "url": "https://xpig.me/icon.png"
      }
    }
  } : null;

  return (
    <>
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}
      <WatchClient videoId={resolvedParams.id} />
    </>
  );
}

export const instant = false;
