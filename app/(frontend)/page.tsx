import Image from "next/image";
import Link from "next/link";
import { CollectionCard } from "./_components/collection-card";
import { Icon } from "./_components/icons";
import { NewsletterForm } from "./_components/newsletter-form";
import { RandomWallpaperLink } from "./_components/random-wallpaper-link";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import { WallpaperCard } from "./_components/wallpaper-card";
import {
  getBlogPostsData,
  getCategoriesData,
  getCollectionsData,
  getWallpapersData,
} from "./_data/cms-data";
import { tools } from "./_data/site-data";

const heroTiles = [
  { src: "/wallpapers/liquid-titanium.webp", alt: "Liquid titanium abstract wallpaper", className: "heroTile heroTileOne" },
  { src: "/wallpapers/aurora-obsidian.webp", alt: "Cyan aurora mountain wallpaper", className: "heroTile heroTileTwo" },
  { src: "/wallpapers/bioluminescent-ocean.webp", alt: "Bioluminescent ocean wallpaper", className: "heroTile heroTileThree" },
  { src: "/wallpapers/neon-monolith.webp", alt: "Cyan brutalist architecture wallpaper", className: "heroTile heroTileFour" },
  { src: "/wallpapers/violet-orbit.webp", alt: "Violet ringed planet wallpaper", className: "heroTile heroTileFive" },
  { src: "/wallpapers/emerald-canopy.webp", alt: "Misty emerald rainforest wallpaper", className: "heroTile heroTileSix" },
  { src: "/wallpapers/ember-dunes.webp", alt: "Black desert dunes wallpaper", className: "heroTile heroTileSeven" },
  { src: "/wallpapers/polar-cathedral.webp", alt: "Blue ice cave wallpaper", className: "heroTile heroTileEight" },
];

export default async function Home() {
  const [wallpapers, categories, collections, blogPosts] = await Promise.all([
    getWallpapersData(),
    getCategoriesData(),
    getCollectionsData(),
    getBlogPostsData(),
  ]);
  const popularWallpapers = [...wallpapers]
    .sort((first, second) => second.popularity - first.popularity)
    .slice(0, 6);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "4K Wallpaper Studio",
    description: "Original 4K wallpapers, curated collections and free screen tools.",
    potentialAction: {
      "@type": "SearchAction",
      target: "/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main id="top">
      <a className="skipLink" href="#main-content">Skip to content</a>
      <SiteHeader overlay />

      <section className="hero" id="main-content" aria-labelledby="hero-title">
        <div className="heroGlow" aria-hidden="true" />
        <div className="heroCopy">
          <p className="eyebrow"><span className="eyebrowDot" /> Original art for every screen</p>
          <h1 id="hero-title">Wallpapers<br />worth your<br />screen<span>.</span></h1>
          <p className="heroDescription">
            Original wallpapers sized for phones, tablets, laptops, 4K desktops and AMOLED displays.
          </p>

          <form className="searchBar" action="/search">
            <label className="srOnly" htmlFor="home-wallpaper-query">Search 4K wallpapers</label>
            <Icon name="search" size={22} />
            <input id="home-wallpaper-query" name="q" type="search" placeholder="Search nature, AMOLED, space…" autoComplete="off" />
            <button type="submit" aria-label="Submit wallpaper search"><Icon name="search" size={24} /></button>
          </form>

          <div className="heroCtas">
            <Link className="primaryButton" href="/explore">Explore Wallpapers <Icon name="arrow" size={19} /></Link>
            <Link className="secondaryButton" href="/tools/name-wallpaper">Create Name Wallpaper</Link>
          </div>

          <div className="quickCategories" aria-label="Popular categories">
            {categories.slice(0, 4).map((category) => (
              <Link href={`/categories/${category.slug}`} key={category.slug}>
                <span aria-hidden="true">✦</span> {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="heroGallery" aria-label="Original wallpaper previews">
          <div className="galleryFade" aria-hidden="true" />
          {heroTiles.map((tile, index) => (
            <div className={tile.className} key={tile.src}>
              <Image src={tile.src} alt={tile.alt} fill unoptimized priority={index < 2} sizes="(max-width: 820px) 46vw, 24vw" />
            </div>
          ))}
        </div>

        <div className="qualityBar" aria-label="Wallpaper quality highlights">
          <p><strong>Original</strong> artwork only</p><span aria-hidden="true" />
          <p><strong>4 sizes</strong> for every screen</p><span aria-hidden="true" />
          <p><strong>Free</strong> personal use</p>
        </div>
      </section>

      <nav className="browseRail" aria-label="Wallpaper browsing shortcuts">
        <Link className="browseTab active" href="/explore"><span aria-hidden="true">⌂</span> Latest</Link>
        <Link className="browseTab" href="/explore?sort=popular"><span aria-hidden="true">●</span> Popular</Link>
        <Link className="browseTab" href="/explore?featured=1"><span aria-hidden="true">★</span> Featured</Link>
        <RandomWallpaperLink slugs={wallpapers.map((wallpaper) => wallpaper.slug)} />
        <Link className="browseTab" href="/collections"><span aria-hidden="true">◆</span> Collections</Link>
      </nav>

      <section className="sectionShell catalogSection" aria-labelledby="popular-title">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Most downloaded this week</p>
            <h2 id="popular-title">Popular wallpapers</h2>
          </div>
          <Link className="textLink" href="/explore?sort=popular">View all wallpapers <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="wallpaperGrid">
          {popularWallpapers.map((wallpaper, index) => (
            <WallpaperCard wallpaper={wallpaper} priority={index < 3} key={wallpaper.slug} />
          ))}
        </div>
      </section>

      <section className="sectionShell" aria-labelledby="categories-title">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Find your atmosphere</p>
            <h2 id="categories-title">Browse categories</h2>
          </div>
          <Link className="textLink" href="/categories">See every category <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="imageCategoryGrid">
          {categories.map((category) => {
            const count = wallpapers.filter((wallpaper) => wallpaper.categorySlug === category.slug).length;
            return (
              <article className="imageCategoryCard" key={category.slug}>
                <Link href={`/categories/${category.slug}`}>
                  <Image src={category.cover} alt={`${category.name} wallpapers`} fill unoptimized sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                  <span className="categoryShade" aria-hidden="true" />
                  <div>
                    <span>{count} original wallpapers</span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <span className="categoryArrow" aria-hidden="true"><Icon name="arrow" size={19} /></span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sectionShell collectionSection" aria-labelledby="collections-title">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Curated for a complete setup</p>
            <h2 id="collections-title">Featured collections</h2>
          </div>
          <Link className="textLink" href="/collections">Explore collections <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="collectionGrid">
          {collections.map((collection) => <CollectionCard collection={collection} key={collection.slug} />)}
        </div>
      </section>

      <section className="generatorSection" aria-labelledby="generator-title">
        <div className="generatorCopy">
          <p className="eyebrow"><Icon name="sparkles" size={18} /> Free studio tools</p>
          <h2 id="generator-title">Make the screen yours.</h2>
          <p>Generate an original AI name wallpaper, build a clean gradient or check the exact resolution your screen needs.</p>
          <Link className="primaryButton" href="/tools">Open all tools <Icon name="arrow" size={19} /></Link>
        </div>
        <div className="toolMiniGrid">
          {tools.map((tool, index) => (
            <Link href={`/tools/${tool.slug}`} className="toolMiniCard" key={tool.slug}>
              <span>0{index + 1}</span>
              <strong>{tool.title}</strong>
              <p>{tool.description}</p>
              <Icon name="arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>

      <section className="sectionShell" aria-labelledby="blog-title">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">From the studio journal</p>
            <h2 id="blog-title">Useful screen guides</h2>
          </div>
          <Link className="textLink" href="/blog">Read the blog <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="blogCardGrid">
          {blogPosts.map((post) => (
            <article className="blogCard" key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <div className="blogCardImage"><Image src={post.cover} alt={post.coverAlt} fill unoptimized sizes="(max-width: 720px) 100vw, 33vw" /></div>
                <p>{post.category} · {post.readTime}</p>
                <h3>{post.title}</h3>
                <span>Read guide <Icon name="arrow" size={17} /></span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="newsletterSection" aria-labelledby="newsletter-title">
        <p className="eyebrow">The Sunday drop</p>
        <h2 id="newsletter-title">New wallpapers. Zero clutter.</h2>
        <p>Get one original collection and one practical screen tip each week.</p>
        <NewsletterForm />
        <small>No spam. Unsubscribe whenever you like.</small>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
