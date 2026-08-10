import Link from "next/link";
import { Icon } from "./icons";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`siteHeader ${overlay ? "homeHeader" : "innerSiteHeader"}`}>
      <Link className="brand" href="/" aria-label="4K Wallpaper Studio home">
        <span>4K</span> Wallpaper Studio
      </Link>

      <nav className="desktopNav" aria-label="Main navigation">
        <Link href="/explore">Explore</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/collections">Collections</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/tools">Tools</Link>
      </nav>

      <div className="headerActions">
        <Link href="/search" aria-label="Search wallpapers">
          <Icon name="search" />
        </Link>
        <Link href="/saved" aria-label="Saved wallpapers">
          <Icon name="heart" />
        </Link>
      </div>

      <details className="mobileMenu">
        <summary aria-label="Open navigation menu">
          <Icon name="menu" />
        </summary>
        <nav aria-label="Mobile navigation">
          <Link href="/explore">Explore</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/search">Search</Link>
          <Link href="/saved">Saved</Link>
        </nav>
      </details>
    </header>
  );
}
