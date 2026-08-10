import type { Metadata } from "next";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";
import { WallpaperCard } from "../_components/wallpaper-card";
import { getWallpapersData } from "../_data/cms-data";

export const metadata: Metadata = {
  title: "Search 4K Wallpapers",
  description: "Search original 4K wallpapers by mood, subject, color or category.",
};

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const wallpapers = await getWallpapersData();
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query
    ? wallpapers.filter((wallpaper) =>
        [wallpaper.title, wallpaper.category, wallpaper.description, wallpaper.palette, ...wallpaper.tags]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : wallpapers;

  return (
    <PageShell>
      <PageHero
        eyebrow="Studio search"
        title={query ? `Results for “${q.trim()}”` : "Find your next wallpaper"}
        description="Search by color, atmosphere, category or subject."
      >
        <form className="searchBar pageSearchBar" action="/search">
          <label className="srOnly" htmlFor="search-page-query">Search 4K wallpapers</label>
          <Icon name="search" size={22} />
          <input id="search-page-query" name="q" type="search" defaultValue={q} placeholder="Try forest, violet, AMOLED…" autoComplete="off" />
          <button type="submit" aria-label="Submit search"><Icon name="search" size={23} /></button>
        </form>
      </PageHero>

      <section className="contentShell searchContent" aria-live="polite">
        <div className="resultSummary"><p>{results.length} {results.length === 1 ? "result" : "results"}</p><span>{query || "Full library"}</span></div>
        {results.length ? (
          <div className="wallpaperGrid">{results.map((wallpaper) => <WallpaperCard wallpaper={wallpaper} key={wallpaper.slug} />)}</div>
        ) : (
          <div className="emptyState">
            <h2>No exact match yet</h2>
            <p>Try a broader word such as nature, dark, blue, abstract or space.</p>
            <a className="primaryButton" href="/search">Browse every wallpaper</a>
          </div>
        )}
      </section>
    </PageShell>
  );
}
