import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageShell } from "../../_components/page-shell";
import { WallpaperCard } from "../../_components/wallpaper-card";
import { getWallpapersData } from "../../_data/cms-data";

export const metadata: Metadata = {
  title: "Anime Dark Hero 4K Wallpapers",
  description:
    "Download original anime-inspired dark hero wallpapers featuring cinematic warriors, mages and guardians. Original artwork only, with no copyrighted characters.",
  alternates: { canonical: "/categories/anime-dark-heroes" },
  openGraph: {
    title: "Anime Dark Hero 4K Wallpapers | 4K Wallpaper Studio",
    description:
      "Original anime-inspired dark hero wallpapers made for phones and high-resolution screens.",
    type: "website",
  },
};

export default async function AnimeDarkHeroesPage() {
  const wallpapers = await getWallpapersData();
  const results = wallpapers.filter((wallpaper) => wallpaper.categorySlug === "anime-dark-heroes");

  return (
    <PageShell>
      <PageHero
        eyebrow="Original anime-inspired collection"
        title="Anime Dark Hero wallpapers"
        description="Cinematic warriors, shadow mages, masked guardians and original dark heroes designed for premium phone and desktop wallpapers. No copyrighted characters or franchise artwork."
      />
      <section className="contentShell searchContent">
        <div className="resultSummary">
          <p>{results.length} original wallpapers</p>
          <span>Mobile-first · High resolution</span>
        </div>

        {results.length > 0 ? (
          <div className="wallpaperGrid">
            {results.map((wallpaper, index) => (
              <WallpaperCard wallpaper={wallpaper} priority={index < 2} key={wallpaper.slug} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "32px 0 12px", maxWidth: 760 }}>
            <h2 style={{ marginBottom: 12 }}>New collection is being prepared</h2>
            <p style={{ opacity: 0.78, lineHeight: 1.7 }}>
              Original anime-inspired dark hero wallpapers will appear here as they are published from Studio. In the meantime, explore the latest original 4K wallpaper releases.
            </p>
            <Link href="/explore" style={{ display: "inline-block", marginTop: 18, textDecoration: "underline" }}>
              Explore all wallpapers
            </Link>
          </div>
        )}
      </section>
    </PageShell>
  );
}
