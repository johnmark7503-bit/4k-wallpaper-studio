import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageShell } from "../_components/page-shell";
import { WallpaperCard } from "../_components/wallpaper-card";
import { getCategoriesData, getWallpapersData } from "../_data/cms-data";

export const metadata: Metadata = {
  title: "Explore Original 4K Wallpapers",
  description: "Browse original 4K wallpapers by category, popularity and featured status.",
};

type ExplorePageProps = {
  searchParams: Promise<{ sort?: string; category?: string; featured?: string }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [categories, wallpapers] = await Promise.all([getCategoriesData(), getWallpapersData()]);
  const { sort = "latest", category = "all", featured } = await searchParams;
  let results = category === "all"
    ? [...wallpapers]
    : wallpapers.filter((wallpaper) => wallpaper.categorySlug === category);

  if (featured === "1") results = results.filter((wallpaper) => wallpaper.featured);
  if (sort === "popular") results.sort((first, second) => second.popularity - first.popularity);
  else results.sort((first, second) => second.published.localeCompare(first.published));

  return (
    <PageShell>
      <PageHero
        eyebrow="Original studio library"
        title="Explore wallpapers"
        description="Filter original artwork by category and discover a 4K download built for your screen."
      />

      <section className="contentShell exploreLayout" aria-label="Wallpaper gallery">
        <aside className="filterPanel">
          <div>
            <span>Browse</span>
            <Link className={category === "all" ? "isActive" : ""} href="/explore">All wallpapers</Link>
            {categories.map((item) => (
              <Link className={category === item.slug ? "isActive" : ""} href={`/explore?category=${item.slug}&sort=${sort}`} key={item.slug}>{item.name}</Link>
            ))}
          </div>
          <div>
            <span>Order</span>
            <Link className={sort === "latest" ? "isActive" : ""} href={`/explore?category=${category}&sort=latest`}>Latest</Link>
            <Link className={sort === "popular" ? "isActive" : ""} href={`/explore?category=${category}&sort=popular`}>Popular</Link>
            <Link className={featured === "1" ? "isActive" : ""} href={`/explore?category=${category}&featured=1`}>Featured</Link>
          </div>
          <div className="resolutionPanel">
            <span>Download size</span>
            <strong>3840 × 2160</strong>
            <p>Every wallpaper on this page includes a real 4K file.</p>
          </div>
        </aside>

        <div>
          <div className="resultSummary">
            <p>{results.length} wallpapers</p>
            <span>{category === "all" ? "All categories" : categories.find((item) => item.slug === category)?.name}</span>
          </div>
          <div className="wallpaperGrid exploreGrid">
            {results.map((wallpaper, index) => <WallpaperCard wallpaper={wallpaper} priority={index < 2} key={wallpaper.slug} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
