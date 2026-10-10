import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/settings/", "/dashboard/"],
    },
    sitemap: "https://xpig.me/sitemap.xml",
  };
}
