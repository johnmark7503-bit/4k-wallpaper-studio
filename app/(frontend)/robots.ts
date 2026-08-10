import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://4kwallpaper.studio";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/cms-api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
