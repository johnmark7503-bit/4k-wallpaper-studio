import Link from "next/link";
import { Icon } from "./_components/icons";
import { PageShell } from "./_components/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <section className="notFoundPage" id="main-content"><p className="eyebrow">404 · Lost in the dark</p><h1>This page is not in the collection.</h1><p>The link may have moved, or the wallpaper is no longer available.</p><Link className="primaryButton" href="/explore">Explore wallpapers <Icon name="arrow" size={18} /></Link></section>
    </PageShell>
  );
}
