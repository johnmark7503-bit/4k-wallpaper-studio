import type { MetadataRoute } from "next";
import {
  getBlogPostsData,
  getCategoriesData,
  getCollectionsData,
  getWallpapersData,
} from "./_data/cms-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [wallpapers, categories, collections, blogPosts] = await Promise.all([
    getWallpapersData(),
    getCategoriesData(),
    getCollectionsData(),
    getBlogPostsData(),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://4kwallpaper.studio";
  const routes = ["", "/explore", "/search", "/categories", "/collections", "/blog", "/tools", "/tools/name-wallpaper", "/tools/gradient-wallpaper", "/tools/screen-resolution", "/about", "/contact", "/advertise", "/privacy", "/terms", "/disclaimer", "/copyright", "/dmca"];
  return [
    ...routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date("2026-08-02"), changeFrequency: route === "" ? "daily" as const : "weekly" as const, priority: route === "" ? 1 : 0.7 })),
    ...wallpapers.map((wallpaper) => ({ url: `${baseUrl}/wallpapers/${wallpaper.slug}`, lastModified: new Date(wallpaper.published), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...categories.map((category) => ({ url: `${baseUrl}/categories/${category.slug}`, lastModified: new Date("2026-08-02"), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...collections.map((collection) => ({ url: `${baseUrl}/collections/${collection.slug}`, lastModified: new Date("2026-08-02"), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...blogPosts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(post.published), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
