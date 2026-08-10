import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, PageShell } from "../../_components/page-shell";
import { WallpaperCard } from "../../_components/wallpaper-card";
import { getCollectionData, getWallpapersData } from "../../_data/cms-data";
import { collections } from "../../_data/site-data";

type CollectionPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionData((await params).slug);
  if (!collection) return {};
  return { title: `${collection.name} Wallpaper Collection`, description: collection.description };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const slug = (await params).slug;
  const [collection, wallpapers] = await Promise.all([
    getCollectionData(slug),
    getWallpapersData(),
  ]);
  if (!collection) notFound();
  const items = collection.wallpaperSlugs
    .map((slug) => wallpapers.find((wallpaper) => wallpaper.slug === slug))
    .filter((wallpaper) => wallpaper !== undefined);

  return (
    <PageShell>
      <PageHero eyebrow="Curated collection" title={collection.name} description={collection.description} />
      <section className="contentShell searchContent">
        <div className="resultSummary"><p>{items.length} wallpapers</p><span>Original · Free personal use</span></div>
        <div className="wallpaperGrid">{items.map((wallpaper, index) => <WallpaperCard wallpaper={wallpaper} priority={index < 2} key={wallpaper.slug} />)}</div>
      </section>
    </PageShell>
  );
}
