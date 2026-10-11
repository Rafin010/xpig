import { MetadataRoute } from "next";
import { encodeVideoId } from "@/lib/obfuscate";
import { TARGET_TAG_PAGES } from "@/lib/seo-keywords";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://xpig.me";

  // Core static landing & directory routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Programmatic Tag landing pages for Google search queries
  const tagRoutes: MetadataRoute.Sitemap = TARGET_TAG_PAGES.map((t) => ({
    url: `${baseUrl}/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Category routes for SERP query indexing
  const categories = ["Deshi", "Bangla", "Viral", "Trending", "HD", "Exclusive"];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Dynamic video routes for Google Video Search indexing
  try {
    const res = await fetch("https://xpig.onrender.com/api/v1/videos/?limit=1000", { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (res.ok) {
      const data = await res.json();
      const videos = Array.isArray(data) ? data : data.items || [];
      
      const videoRoutes: MetadataRoute.Sitemap = videos.map((video: any) => ({
        url: `${baseUrl}/watch/${encodeVideoId(video.id)}`,
        lastModified: new Date(video.created_at || new Date()),
        changeFrequency: "daily",
        priority: 0.9,
      }));
      
      return [...routes, ...tagRoutes, ...categoryRoutes, ...videoRoutes];
    }
  } catch (error) {
    console.error("Could not fetch dynamic routes for sitemap from production API.");
  }

  return [...routes, ...tagRoutes, ...categoryRoutes];
}
