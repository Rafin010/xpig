import VideoGrid from '@/components/video/VideoGrid';
import { SeoContent } from '@/components/layout/SeoContent';

async function getVideosData(page: number, category: string = 'All') {
  try {
    const size = 48;
    const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';
    let url = `${apiBase}/api/v1/discover/search?size=${size}&page=${page}`;
    if (category && category !== 'All') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (err) {
    console.error("Failed to load videos from API:", err);
    return { items: [], total: 0, page: 1, size: 48 };
  }
}

async function getActiveSponsors() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';
    const res = await fetch(`${apiBase}/api/v1/sponsors/`, { cache: 'no-store' });
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

  return (
    <div className="w-full h-full px-3 sm:px-6 md:px-8 pt-5 sm:pt-7 pb-24 sm:pb-16 bg-[#050505] min-h-screen flex flex-col">
      <div className="flex-1">
        <VideoGrid 
          videos={data.items} 
          sponsors={sponsors} 
          activeCategory={activeCategory} 
          totalVideos={totalItems} 
          currentPage={currentPage}
          pageSize={48}
        />
      </div>

      {/* Ultra Pro SEO Semantic Keyword & Category Section */}
      <SeoContent />
    </div>
  );
}
