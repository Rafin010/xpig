import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://xpig.me";

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }
  ];

  // Dynamic video routes for SEO
  try {
    // Fetch the latest videos to index them on Google
    const res = await fetch("http://127.0.0.1:8000/api/v1/videos/?limit=1000", { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (res.ok) {
      const data = await res.json();
      const videos = data.items || [];
      
      const videoRoutes: MetadataRoute.Sitemap = videos.map((video: any) => ({
        url: `${baseUrl}/watch?v=${video.id}`,
        lastModified: new Date(video.created_at || new Date()),
        changeFrequency: "daily",
        priority: 0.9,
      }));
      
      return [...routes, ...videoRoutes];
    }
  } catch (error) {
    console.error("Could not fetch dynamic routes for sitemap, falling back to static only.");
  }

  return routes;
}
