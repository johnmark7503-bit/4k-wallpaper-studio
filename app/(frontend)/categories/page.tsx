import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";
import { getCategoriesData, getWallpapersData } from "../_data/cms-data";

export const metadata: Metadata = {
  title: "Wallpaper Categories",
  description: "Browse original 4K AMOLED, nature, abstract, space and architecture wallpapers.",
};

export default async function CategoriesPage() {
  const [categories, wallpapers] = await Promise.all([getCategoriesData(), getWallpapersData()]);
  return (
    <PageShell>
      <PageHero eyebrow="Browse by atmosphere" title="Wallpaper categories" description="Every category is built from original artwork, with real 4K downloads and no copyrighted characters." />
      <section className="contentShell categoryIndexGrid">
        {categories.map((category) => {
          const count = wallpapers.filter((wallpaper) => wallpaper.categorySlug === category.slug).length;
          return (
            <article className="categoryIndexCard" key={category.slug}>
              <Link href={`/categories/${category.slug}`}>
                <Image src={category.cover} alt={`${category.name} 4K wallpapers`} fill unoptimized sizes="(max-width: 760px) 100vw, 50vw" />
                <span className="categoryShade" aria-hidden="true" />
                <div><span>{count} wallpapers</span><h2>{category.name}</h2><p>{category.description}</p></div>
                <span className="categoryArrow" aria-hidden="true"><Icon name="arrow" size={20} /></span>
              </Link>
            </article>
          );
        })}
      </section>
    </PageShell>
  );
}
