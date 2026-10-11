import { NextResponse } from 'next/server';
import { encodeVideoId } from '@/lib/obfuscate';

function escapeXml(unsafe: string = ''): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = 'https://xpig.me';

  try {
    const res = await fetch('https://xpig.onrender.com/api/v1/videos/?limit=1000', {
      next: { revalidate: 3600 },
    });

    let videos: any[] = [];
    if (res.ok) {
      const data = await res.json();
      videos = Array.isArray(data) ? data : data.items || [];
    }

    const xmlItems = videos
      .map((video) => {
        const watchUrl = `${baseUrl}/watch/${encodeVideoId(video.id)}`;
        const thumbUrl = video.thumbnail_url || `${baseUrl}/og-image.jpg`;
        const title = escapeXml(video.title || `Bangla & Deshi Viral Video ${video.id}`);
        const description = escapeXml(
          video.description || `${video.title || 'Video'} - Watch exclusive Bangla and Deshi adult video collection on XPIG.me in Full HD 1080p.`
        );
        const durationSeconds = video.duration || 300;
        const pubDate = video.created_at ? new Date(video.created_at).toISOString() : new Date().toISOString();
        const contentUrl = video.sources?.[0]?.source_url || video.video_url || '';

        return `  <url>
    <loc>${watchUrl}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbUrl)}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>${description}</video:description>
      ${contentUrl ? `<video:content_loc>${escapeXml(contentUrl)}</video:content_loc>` : ''}
      <video:player_loc>${watchUrl}</video:player_loc>
      <video:duration>${durationSeconds}</video:duration>
      <video:publication_date>${pubDate}</video:publication_date>
      <video:family_friendly>no</video:family_friendly>
      <video:view_count>${video.views || 100}</video:view_count>
      <video:tag>deshi</video:tag>
      <video:tag>bangla sex video</video:tag>
      <video:tag>viral video</video:tag>
      <video:tag>bangla 18 plus</video:tag>
    </video:video>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlItems}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating Google Video Sitemap:', error);
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
</urlset>`;
    return new NextResponse(emptyXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
