import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://4k-wallpaper-studio.vercel.app",
      lastModified: new Date(),
    },
  ];
}
