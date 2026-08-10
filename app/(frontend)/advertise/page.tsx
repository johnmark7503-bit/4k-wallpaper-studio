import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";

export const metadata: Metadata = { title: "Advertise With Us", description: "Advertising and partnership placements for 4K Wallpaper Studio." };

export default function AdvertisePage() {
  return (
    <PageShell>
      <PageHero eyebrow="Brand partnerships" title="Reach a visual, screen-focused audience" description="Planned placements are designed to support the site without covering wallpaper previews or interrupting downloads." />
      <section className="contentShell editorialGrid" id="placements">
        <article><span>01</span><h2>Collection partner</h2><p>A clearly labeled sponsorship around an original editorial collection, with no ownership claim over the artwork.</p></article>
        <article><span>02</span><h2>Guide placement</h2><p>Contextual placement beside relevant display, design or productivity guidance.</p></article>
        <article><span>03</span><h2>Tool recommendation</h2><p>A disclosed partner card shown only when the product genuinely helps with the task.</p></article>
      </section>
      <section className="wideCta"><div><p className="eyebrow">Media enquiries</p><h2>Prepare your brand, audience and campaign goal.</h2></div><Link className="secondaryButton" href="/contact">Open contact routes <Icon name="arrow" size={18} /></Link></section>
    </PageShell>
  );
}
