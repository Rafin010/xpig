import VideoGrid from '@/components/video/VideoGrid';

export const instant = false;

async function getVideos() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/discover/search?size=20&page=1', { 
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
  const initialVideos = await getVideos();

  return (
    <div className="w-full h-full p-4 md:p-6 bg-[#0a0a0a]">
      <VideoGrid initialVideos={initialVideos} />
    </div>
  );
}
