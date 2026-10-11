import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, Home, ChevronRight, Flame } from 'lucide-react';
import VideoGrid from '@/components/video/VideoGrid';
import { SeoContent } from '@/components/layout/SeoContent';
import { findTagBySlug, TARGET_TAG_PAGES, POPULAR_SEARCH_PILLS } from '@/lib/seo-keywords';

async function getTagVideos(query: string) {
  try {
    const res = await fetch(
      `https://xpig.onrender.com/api/v1/discover/search?q=${encodeURIComponent(query)}&size=36`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items;
      }
    }
  } catch (err) {}

  // Fallback to top videos if no specific keyword match
  try {
    const res = await fetch(`https://xpig.onrender.com/api/v1/discover/search?size=36`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data.items || [];
    }
  } catch (e) {}

  return [];
}

async function getActiveSponsors() {
  try {
    const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = findTagBySlug(slug);
  const canonicalUrl = `https://xpig.me/tag/${slug}`;

  return {
    title: tag.metaTitle,
    description: tag.metaDescription,
    keywords: [
      tag.name,
      'deshi bhabi sex video',
      'Bangla sex video',
      'Deshi viral video',
      'বাংলা অ্যাডাল্ট ভিডিও',
      'বাংলা ১৮ প্লাস ভিডিও',
      'XPIG.me',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tag.metaTitle,
      description: tag.metaDescription,
      url: canonicalUrl,
      siteName: 'XPIG',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 675,
          alt: tag.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tag.metaTitle,
      description: tag.metaDescription,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = findTagBySlug(slug);
  const [videos, sponsors] = await Promise.all([
    getTagVideos(tag.query),
    getActiveSponsors(),
  ]);

  // Schema.org BreadcrumbList for Google SERP Navigation Rich Results
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://xpig.me',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tags',
        item: 'https://xpig.me/tags',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tag.name,
        item: `https://xpig.me/tag/${slug}`,
      },
    ],
  };

  return (
    <div className="w-full h-full px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-28 sm:pb-20 bg-[#050505] min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 mb-4 sm:mb-6">
        <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>হোম</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <Link href="/tags" className="hover:text-white transition-colors">
          ট্যাগস
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-zinc-300 font-semibold truncate max-w-[200px] sm:max-w-none">
          {tag.name}
        </span>
      </nav>

      {/* Hero Header for this Tag / Keyword */}
      <div className="bg-[#0b0b0d] border border-zinc-800/80 rounded-2xl p-5 sm:p-7 mb-7 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/30">
            <Tag className="w-3 h-3" />
            TOP SEARCHED
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300">
            1080p Full HD
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {tag.heading}
        </h1>

        <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
          {tag.intro}
        </p>

        {/* Related Quick Tag Links */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-pink-500" /> সম্পর্কিত সার্চ:
          </span>
          {TARGET_TAG_PAGES.filter((p) => p.slug !== slug)
            .slice(0, 6)
            .map((peer) => (
              <Link
                key={peer.slug}
                href={`/tag/${peer.slug}`}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/90 text-zinc-300 hover:text-white transition-colors"
              >
                {peer.name}
              </Link>
            ))}
        </div>
      </div>

      {/* Videos matching this tag */}
      <div className="flex-1">
        <VideoGrid videos={videos} sponsors={sponsors} />
      </div>

      {/* Structured SEO Overview */}
      <SeoContent />
    </div>
  );
}
