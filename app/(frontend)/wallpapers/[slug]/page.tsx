import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "../../_components/icons";
import { PageShell } from "../../_components/page-shell";
import { SaveButton } from "../../_components/save-button";
import { ShareButton } from "../../_components/share-button";
import { WallpaperCard } from "../../_components/wallpaper-card";
import { WallpaperDownloadOptions } from "../../_components/wallpaper-download-options";
import { getWallpaperData, getWallpapersData } from "../../_data/cms-data";
import { wallpapers as demoWallpapers } from "../../_data/site-data";

type WallpaperPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return demoWallpapers.map((wallpaper) => ({ slug: wallpaper.slug }));
}

export async function generateMetadata({ params }: WallpaperPageProps): Promise<Metadata> {
  const wallpaper = await getWallpaperData((await params).slug);
  if (!wallpaper) return {};
  return {
    title: `${wallpaper.title} 4K Wallpaper`,
    description: wallpaper.description,
    openGraph: {
      title: `${wallpaper.title} — Free 4K Wallpaper`,
      description: wallpaper.description,
      images: [{ url: wallpaper.src, alt: wallpaper.alt }],
    },
  };
}

export default async function WallpaperPage({ params }: WallpaperPageProps) {
  const slug = (await params).slug;
  const wallpapers = await getWallpapersData();
  const wallpaper = wallpapers.find((item) => item.slug === slug);
  if (!wallpaper) notFound();

  const related = [
    ...wallpapers.filter((item) => item.slug !== wallpaper.slug && item.categorySlug === wallpaper.categorySlug),
    ...wallpapers.filter((item) => item.slug !== wallpaper.slug && item.categorySlug !== wallpaper.categorySlug),
  ].slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: wallpaper.title,
    description: wallpaper.description,
    contentUrl: wallpaper.downloadSrc,
    thumbnailUrl: wallpaper.src,
    width: 3840,
    height: 2160,
    encodingFormat: "image/webp",
    creditText: "4K Wallpaper Studio",
  };

  return (
    <PageShell>
      <article className="wallpaperDetail" id="main-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href={`/categories/${wallpaper.categorySlug}`}>{wallpaper.category}</Link><span>/</span>
          <span aria-current="page">{wallpaper.title}</span>
        </nav>

        <div className="wallpaperDetailGrid">
          <div className="wallpaperPreviewLarge">
            <Image src={wallpaper.src} alt={wallpaper.alt} fill unoptimized priority sizes="(max-width: 900px) 100vw, 66vw" />
            <span className="resolutionBadge">4 device-ready sizes</span>
          </div>

          <div className="wallpaperInfoPanel">
            <p className="eyebrow"><span className="eyebrowDot" /> {wallpaper.category}</p>
            <h1>{wallpaper.title}</h1>
            <p className="wallpaperDescription">{wallpaper.description}</p>
            <WallpaperDownloadOptions downloadSrc={wallpaper.downloadSrc} downloadSources={wallpaper.downloadSources} slug={wallpaper.slug} />
            <div className="wallpaperActions wallpaperSecondaryActions">
              <SaveButton slug={wallpaper.slug} />
              <ShareButton slug={wallpaper.slug} title={wallpaper.title} />
            </div>
            <small className="downloadNote">High-resolution WebP · Free for personal device use</small>

            <dl className="wallpaperSpecs">
              <div><dt>Sizes</dt><dd>Phone · Tablet · Laptop · 4K</dd></div>
              <div><dt>Format</dt><dd>WebP</dd></div>
              <div><dt>Palette</dt><dd>{wallpaper.palette}</dd></div>
              <div><dt>License</dt><dd>Personal use</dd></div>
            </dl>

            <div className="tagList" aria-label="Wallpaper tags">
              {wallpaper.tags.slice(0, 6).map((tag) => <Link href={`/search?q=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}
            </div>
          </div>
        </div>

        <section className="wallpaperEditorial">
          <div><p className="eyebrow">About this artwork</p><h2>Designed to stay quiet behind your work.</h2></div>
          <div>
            <p>{wallpaper.description}</p>
            <p>Each artwork now includes dedicated Phone, Tablet, Laptop and Desktop 4K downloads, so the crop feels natural on every screen.</p>
          </div>
        </section>
      </article>

      <section className="sectionShell relatedSection" aria-labelledby="related-title">
        <div className="sectionHeading"><div><p className="eyebrow">Continue exploring</p><h2 id="related-title">Related wallpapers</h2></div><Link className="textLink" href="/explore">View all <Icon name="arrow" size={18} /></Link></div>
        <div className="wallpaperGrid">{related.map((item) => <WallpaperCard wallpaper={item} key={item.slug} />)}</div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </PageShell>
  );
}
