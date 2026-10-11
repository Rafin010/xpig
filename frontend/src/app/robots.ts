import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/settings",
          "/dashboard",
          "/api/admin/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/*", "/api/admin/*"],
      },
      {
        userAgent: "Googlebot-Video",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/*"],
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow: ["/admin/*"],
      },
    ],
    sitemap: [
      "https://xpig.me/sitemap.xml",
      "https://xpig.me/sitemap-video.xml",
    ],
    host: "https://xpig.me",
  };
}
