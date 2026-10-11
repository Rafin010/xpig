import VideoGrid from '@/components/video/VideoGrid';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';


async function getVideosData(page: number, category: string = 'All') {
  try {
    const size = 24;
    let url = `https://xpig.onrender.com/api/v1/discover/search?size=${size}&page=${page}`;
    if (category && category !== 'All') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (err) {
    console.error("Failed to load videos from API:", err);
    return { items: [], total: 0, page: 1, size: 24 };
  }
}

async function getActiveSponsors() {
  try {
    const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; category?: string }> 
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || '1', 10));
  const activeCategory = sp.category || 'All';
  const [data, sponsors] = await Promise.all([
    getVideosData(currentPage, activeCategory),
    getActiveSponsors()
  ]);
  
  const totalItems = data.total || 0;
  const pageSize = data.size || 24;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Generate pagination items: e.g. [1, 2, 3, 4, 5, '...', totalPages]
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const paginationPages = getPaginationPages();

  const getPageUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set('page', p.toString());
    if (activeCategory && activeCategory !== 'All') {
      params.set('category', activeCategory);
    }
    return `/?${params.toString()}`;
  };

  return (
    <div className="w-full h-full p-4 md:p-6 bg-[#050505] min-h-screen flex flex-col">
      <div className="flex-1">
        <VideoGrid videos={data.items} sponsors={sponsors} activeCategory={activeCategory} />
      </div>

      {/* Professional Tube Pagination */}
      {totalPages > 1 && (
        <div className="mt-14 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
          <div className="text-xs text-zinc-500 font-medium order-2 sm:order-1">
            Showing <span className="text-zinc-300 font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-zinc-300 font-bold">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-zinc-200 font-bold">{totalItems}</span> videos
          </div>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {/* First Page */}
            {currentPage > 1 && (
              <Link
                href={getPageUrl(1)}
                className="p-2 rounded-xl bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Link>
            )}

            {/* Previous Page */}
            {currentPage > 1 && (
              <Link
                href={getPageUrl(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors font-semibold text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </Link>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-zinc-800">
              {paginationPages.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-zinc-600 text-xs font-bold">
                      •••
                    </span>
                  );
                }

                const pageNum = p as number;
                const isActive = pageNum === currentPage;

                return (
                  <Link
                    key={`page-${pageNum}`}
                    href={getPageUrl(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {/* Next Page */}
            {currentPage < totalPages && (
              <Link
                href={getPageUrl(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors font-semibold text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}

            {/* Last Page */}
            {currentPage < totalPages && (
              <Link
                href={getPageUrl(totalPages)}
                className="p-2 rounded-xl bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
