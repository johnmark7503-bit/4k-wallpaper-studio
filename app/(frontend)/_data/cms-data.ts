import type {
  BlogPost as PayloadBlogPost,
  Category as PayloadCategory,
  Collection as PayloadCollection,
  Media,
  Wallpaper as PayloadWallpaper,
} from "../../../payload-types";
import {
  blogPosts as demoBlogPosts,
  categories as demoCategories,
  collections as demoCollections,
  wallpapers as demoWallpapers,
  type BlogPost,
  type Wallpaper,
} from "./site-data";

export type SiteCategory = {
  slug: string;
  name: string;
  description: string;
  cover: string;
};

export type SiteCollection = {
  slug: string;
  name: string;
  description: string;
  cover: string;
  wallpaperSlugs: string[];
};

const cmsOrigin =
  process.env.CMS_API_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "");

async function getCmsDocuments<T>(collection: string, sort?: string): Promise<T[] | null> {
  if (!cmsOrigin || !process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) return null;
  try {
    const url = new URL(`/cms-api/${collection}`, cmsOrigin);
    url.searchParams.set("depth", "2");
    url.searchParams.set("limit", "100");
    url.searchParams.set("where[_status][equals]", "published");
    if (sort) url.searchParams.set("sort", sort);
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    const result = (await response.json()) as { docs?: T[] };
    return result.docs ?? null;
  } catch {
    return null;
  }
}

function mediaUrl(value: number | Media | null | undefined, fallback: string) {
  return typeof value === "object" && value?.url ? value.url : fallback;
}

function toWallpaper(document: PayloadWallpaper): Wallpaper {
  const category = typeof document.category === "object" ? document.category : null;
  const fallback = demoWallpapers.find((item) => item.slug === document.slug) ?? demoWallpapers[0];
  const desktop = mediaUrl(document.downloads.desktop4K, fallback.downloadSrc);
  return {
    slug: document.slug,
    title: document.title,
    category: category?.name ?? fallback.category,
    categorySlug: category?.slug ?? fallback.categorySlug,
    collectionSlugs:
      document.collections?.flatMap((item) => (typeof item === "object" ? [item.slug] : [])) ?? [],
    description: document.description,
    src: mediaUrl(document.previewImage, fallback.src),
    downloadSrc: desktop,
    downloadSources: {
      phone: mediaUrl(document.downloads.phone, desktop),
      tablet: mediaUrl(document.downloads.tablet, desktop),
      laptop: mediaUrl(document.downloads.laptop, desktop),
      desktop,
    },
    alt:
      typeof document.previewImage === "object"
        ? document.previewImage.alt
        : `${document.title} original 4K wallpaper`,
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: document.palette ?? "Studio palette",
    published: document.createdAt.slice(0, 10),
    popularity: document.popularity ?? 0,
    featured: document.featured ?? false,
    tags: document.tags?.map((item) => item.tag) ?? [],
  };
}

function toCategory(document: PayloadCategory): SiteCategory {
  const fallback = demoCategories.find((item) => item.slug === document.slug)?.cover ?? demoCategories[0].cover;
  return {
    slug: document.slug,
    name: document.name,
    description: document.description,
    cover: mediaUrl(document.cover, fallback),
  };
}

function toCollection(document: PayloadCollection): SiteCollection {
  const fallback = demoCollections.find((item) => item.slug === document.slug)?.cover ?? demoCollections[0].cover;
  return {
    slug: document.slug,
    name: document.name,
    description: document.description,
    cover: mediaUrl(document.cover, fallback),
    wallpaperSlugs: document.wallpapers?.flatMap((item) => (typeof item === "object" ? [item.slug] : [])) ?? [],
  };
}

function textFromLexical(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const item = node as { text?: unknown; children?: unknown[] };
  if (typeof item.text === "string") return item.text;
  return item.children?.map(textFromLexical).join("").trim() ?? "";
}

function toBlogPost(document: PayloadBlogPost): BlogPost {
  const fallback = demoBlogPosts.find((item) => item.slug === document.slug) ?? demoBlogPosts[0];
  const children = document.body?.root?.children ?? [];
  const paragraphs = children.map(textFromLexical).filter(Boolean);
  return {
    slug: document.slug,
    title: document.title,
    excerpt: document.excerpt,
    cover: mediaUrl(document.cover, fallback.cover),
    coverAlt: typeof document.cover === "object" ? document.cover.alt : document.title,
    category: document.category,
    readTime: `${document.readTime ?? 5} min read`,
    published: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(document.publishedAt ?? document.createdAt)),
    sections: [
      {
        heading: document.title,
        paragraphs: paragraphs.length ? paragraphs : [document.excerpt],
      },
    ],
  };
}

export async function getWallpapersData() {
  const documents = await getCmsDocuments<PayloadWallpaper>("wallpapers", "-createdAt");
  return documents?.length ? documents.map(toWallpaper) : [...demoWallpapers];
}

export async function getWallpaperData(slug: string) {
  return (await getWallpapersData()).find((item) => item.slug === slug);
}

export async function getCategoriesData() {
  const documents = await getCmsDocuments<PayloadCategory>("categories", "_order");
  return documents?.length ? documents.map(toCategory) : demoCategories.map((item) => ({ ...item }));
}

export async function getCategoryData(slug: string) {
  return (await getCategoriesData()).find((item) => item.slug === slug);
}

export async function getCollectionsData() {
  const documents = await getCmsDocuments<PayloadCollection>("collections", "_order");
  return documents?.length
    ? documents.map(toCollection)
    : demoCollections.map((item) => ({ ...item, wallpaperSlugs: [...item.wallpaperSlugs] }));
}

export async function getCollectionData(slug: string) {
  return (await getCollectionsData()).find((item) => item.slug === slug);
}

export async function getBlogPostsData() {
  const documents = await getCmsDocuments<PayloadBlogPost>("blog-posts", "-publishedAt");
  return documents?.length ? documents.map(toBlogPost) : [...demoBlogPosts];
}

export async function getBlogPostData(slug: string) {
  return (await getBlogPostsData()).find((item) => item.slug === slug);
}
