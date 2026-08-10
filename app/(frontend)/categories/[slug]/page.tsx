import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, PageShell } from "../../_components/page-shell";
import { WallpaperCard } from "../../_components/wallpaper-card";
import { getCategoryData, getWallpapersData } from "../../_data/cms-data";
import { categories } from "../../_data/site-data";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryData((await params).slug);
  if (!category) return {};
  return { title: `${category.name} 4K Wallpapers`, description: category.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = (await params).slug;
  const [category, wallpapers] = await Promise.all([
    getCategoryData(slug),
    getWallpapersData(),
  ]);
  if (!category) notFound();
  const results = wallpapers.filter((wallpaper) => wallpaper.categorySlug === category.slug);

  return (
    <PageShell>
      <PageHero eyebrow="Wallpaper category" title={`${category.name} wallpapers`} description={category.description} />
      <section className="contentShell searchContent">
        <div className="resultSummary"><p>{results.length} original wallpapers</p><span>4K · 3840 × 2160</span></div>
        <div className="wallpaperGrid">{results.map((wallpaper, index) => <WallpaperCard wallpaper={wallpaper} priority={index < 2} key={wallpaper.slug} />)}</div>
      </section>
    </PageShell>
  );
}
