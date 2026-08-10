import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";

export const metadata: Metadata = {
  title: "About the Studio",
  description: "Learn how 4K Wallpaper Studio creates original wallpapers, tools and useful screen guides.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Independent visual studio" title="Original images. Useful tools. A calmer screen." description="4K Wallpaper Studio is being built as a focused home for original wallpapers, practical browser tools and helpful display guides." />
      <section className="contentShell editorialGrid">
        <article><span>01</span><h2>Original first</h2><p>The studio library avoids copyrighted cartoon, anime and franchise characters. Demo artwork is created specifically for this website and reviewed before publication.</p></article>
        <article><span>02</span><h2>Useful beyond the download</h2><p>Screen-resolution guidance, custom wallpaper generators and practical articles give Pinterest visitors a reason to stay, return and share.</p></article>
        <article><span>03</span><h2>Built for a real business</h2><p>The wider product plan supports advertising, affiliate recommendations and premium wallpaper packs without turning every page into clutter.</p></article>
      </section>
      <section className="wideCta"><div><p className="eyebrow">Start exploring</p><h2>Find a wallpaper made for your screen.</h2></div><Link className="primaryButton" href="/explore">Browse the library <Icon name="arrow" size={18} /></Link></section>
    </PageShell>
  );
}
