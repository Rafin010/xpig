import VideoGrid from '@/components/video/VideoGrid';
import Link from 'next/link';

export const instant = false;

async function getVideosData(page: number) {
  try {
    const res = await fetch(`https://xpig.onrender.com/api/v1/discover/search?size=20&page=${page}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (err) {
    console.error("Failed to load videos from API:", err);
    return { items: [], total: 0, page: 1, size: 20 };
  }
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || '1', 10);
  const data = await getVideosData(currentPage);
  
  const totalPages = Math.max(1, Math.ceil(data.total / data.size));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="w-full h-full p-4 md:p-6 bg-[#050505] min-h-screen flex flex-col">
      <div className="flex-1">
        {data.items.length > 0 ? (
          <VideoGrid initialVideos={data.items} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <p className="text-xl font-bold">No videos found for this page.</p>
          </div>
        )}
      </div>

      {/* Professional Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 mb-8 flex justify-center items-center gap-2">
          {currentPage > 1 && (
            <Link 
              href={`/?page=${currentPage - 1}`}
              className="px-4 py-2 rounded-xl bg-[#111] border border-zinc-800 text-zinc-400 hover:text-white hover:border-pink-500 transition-colors font-semibold text-sm"
            >
              Previous
            </Link>
          )}

          <div className="flex items-center gap-1 bg-[#111] p-1 rounded-xl border border-zinc-800">
            {pages.map(p => {
              if (p > 10 && p !== totalPages && p !== currentPage) return null;
              
              if (p === currentPage) {
                return (
                  <span key={p} className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    {p}
                  </span>
                );
              }
              
              return (
                <Link 
                  key={p} 
                  href={`/?page=${p}`}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-semibold"
                >
                  {p}
                </Link>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <Link 
              href={`/?page=${currentPage + 1}`}
              className="px-4 py-2 rounded-xl bg-[#111] border border-zinc-800 text-zinc-400 hover:text-white hover:border-pink-500 transition-colors font-semibold text-sm"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
