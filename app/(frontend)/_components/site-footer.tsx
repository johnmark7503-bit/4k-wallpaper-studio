import Link from "next/link";
import { Icon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="footerBrandBlock">
        <Link className="brand" href="/">
          <span>4K</span> Wallpaper Studio
        </Link>
        <p>
          Original 4K wallpapers and useful screen tools, built for clean desktops,
          phones and Pinterest discovery.
        </p>
        <Link className="footerTopLink" href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </Link>
      </div>

      <nav aria-label="Explore links">
        <strong>Explore</strong>
        <Link href="/explore">Latest wallpapers</Link>
        <Link href="/explore?sort=popular">Popular</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/collections">Collections</Link>
        <Link href="/saved">Saved</Link>
      </nav>

      <nav aria-label="Studio links">
        <strong>Studio</strong>
        <Link href="/tools">Free tools</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/advertise">Advertise</Link>
      </nav>

      <nav aria-label="Legal links">
        <strong>Legal</strong>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <Link href="/copyright">Copyright</Link>
        <Link href="/dmca">DMCA</Link>
      </nav>

      <div className="footerBottom">
        <p>© {new Date().getFullYear()} 4K Wallpaper Studio</p>
        <p><Icon name="sparkles" size={14} /> Original demo artwork. No copyrighted characters.</p>
      </div>
    </footer>
  );
}
