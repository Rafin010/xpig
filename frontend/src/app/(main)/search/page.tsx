'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Film, Flame, Play, Clock, Eye, X } from 'lucide-react';
import { encodeVideoId } from '@/lib/obfuscate';
import { POPULAR_SEARCH_PILLS } from '@/lib/seo-keywords';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Synchronize query when URL search param changes
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) {
      setQuery(qParam);
    }
  }, [searchParams]);

  // Load catalog on mount for fast instant searching
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await fetch('https://xpig.onrender.com/api/v1/discover/search');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAllVideos(data.items || []);
          }
        }
      } catch (err) {
        console.error('Failed to load search catalog:', err);
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter videos based on query
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = allVideos.filter((v: any) => {
        const titleMatch = v.title?.toLowerCase().includes(q);
        const descMatch = v.description?.toLowerCase().includes(q);
        const catMatch = Array.isArray(v.categories) 
          ? v.categories.some((c: string) => c.toLowerCase().includes(q))
          : false;
        return titleMatch || descMatch || catMatch;
      });
      setResults(filtered);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, allVideos]);

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white px-4 sm:px-6 md:px-8 py-6 pb-28">
      {/* Search Header & Input */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search viral videos, deshi clips, tags..."
            autoFocus
            className="w-full bg-[#121215] border border-zinc-800 focus:border-pink-500 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all shadow-lg"
          />
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Search Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-pink-500" />
            Trending:
          </span>
          {POPULAR_SEARCH_PILLS.slice(0, 8).map((pill) => (
            <button
              key={pill.label}
              onClick={() => setQuery(pill.query)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all active:scale-95"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto mt-8">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 mt-2">Searching videos...</p>
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-4">
                Found <span className="text-white font-bold">{results.length}</span> results for &ldquo;{query}&rdquo;
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {results.map((video) => (
                  <Link
                    key={video.id}
                    href={`/watch/${encodeVideoId(video.id)}`}
                    className="group bg-[#111114] border border-zinc-800/80 hover:border-pink-500/50 rounded-xl overflow-hidden transition-all flex flex-col shadow-sm"
                  >
                    <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Play className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-pink-600/90 flex items-center justify-center text-white shadow-lg">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 font-mono">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-zinc-500" />
                          {(video.views || 0).toLocaleString()}
                        </span>
                        <span className="capitalize">{video.categories?.[0] || 'Viral'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
              <Film className="w-12 h-12 text-zinc-700" />
              <p className="text-sm font-semibold text-zinc-400">No videos found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-500">Try searching for other keywords like Deshi, Hot, or Viral.</p>
            </div>
          )
        ) : (
          /* Recommended Videos when query is empty */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-pink-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recommended For You</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {allVideos.slice(0, 15).map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${encodeVideoId(video.id)}`}
                  className="group bg-[#111114] border border-zinc-800/80 hover:border-pink-500/50 rounded-xl overflow-hidden transition-all flex flex-col shadow-sm"
                >
                  <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Play className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-pink-600/90 flex items-center justify-center text-white shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-zinc-500" />
                        {(video.views || 0).toLocaleString()}
                      </span>
                      <span className="capitalize">{video.categories?.[0] || 'Deshi'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] p-8 text-center text-zinc-500">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
