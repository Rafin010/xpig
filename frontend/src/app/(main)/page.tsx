import { PlayCircle, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const instant = false;

async function getVideos() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/discover/search', { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Failed to load videos from API:", err);
    return [];
  }
}

export default async function HomePage() {
  const categories = ["All", "Premium", "Verified", "Amateur", "VR", "Couples", "Solo", "Trending", "Exclusive"];
  const videos = await getVideos();

  return (
    <div className="w-full h-full p-4 md:p-6 bg-[#0a0a0a]">
      
      {/* Category Pills */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat, i) => (
          <button 
            key={cat} 
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0 
                ? 'bg-white text-black' 
                : 'bg-[#1a1a1a] text-zinc-300 hover:bg-[#2a2a2a] border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">
        Recommended For You
      </h1>

      {videos.length === 0 ? (
        <div className="text-zinc-500 flex flex-col items-center justify-center py-20">
          <p>No videos found. Did you seed the database?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video: any) => (
            <Link href={`/watch/${video.id}`} key={video.id} className="group flex flex-col gap-2">
              
              {/* Thumbnail Box */}
              <div className="aspect-[16/9] bg-[#1a1a1a] rounded-lg overflow-hidden relative border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-zinc-600 font-bold">NO THUMBNAIL</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center z-10">
                  <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 drop-shadow-lg" />
                </div>

                {/* NEW Badge (If within 72 hours) */}
                {video.created_at && (new Date().getTime() - new Date(video.created_at).getTime()) < 72 * 60 * 60 * 1000 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-pink-600 rounded text-[10px] font-black text-white tracking-widest uppercase z-20 shadow-lg shadow-pink-900/50">
                    NEW
                  </div>
                )}
                
                {/* Duration Badge */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[11px] font-bold text-white z-20 flex items-center gap-1 backdrop-blur-sm">
                  {video.duration || "0:00"}
                </div>
              </div>

              {/* Video Meta */}
              <div className="flex gap-3 mt-1 px-1">
                <div className="w-9 h-9 bg-pink-500 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {video.creator_id}
                </div>
                
                <div className="flex flex-col overflow-hidden">
                  <h3 className="font-medium text-[15px] text-zinc-100 leading-snug line-clamp-2 group-hover:text-pink-400 transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[13px] text-zinc-400 hover:text-white transition-colors truncate">
                      Creator {video.creator_id}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  </div>

                  <div className="flex items-center gap-3 text-[12px] text-zinc-500 mt-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {video.views || 0}
                    </span>
                    <span className="flex items-center gap-1 text-green-500/90">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {video.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
              
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
