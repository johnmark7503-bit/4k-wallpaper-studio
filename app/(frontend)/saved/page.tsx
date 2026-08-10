import type { Metadata } from "next";
import { PageHero, PageShell } from "../_components/page-shell";
import { SavedWallpapers } from "./saved-wallpapers";

export const metadata: Metadata = { title: "Saved Wallpapers", description: "View wallpapers saved on this device." };

export default function SavedPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Your device library" title="Saved wallpapers" description="Favorites are stored privately in this browser, so no account is required." />
      <section className="contentShell searchContent"><SavedWallpapers /></section>
    </PageShell>
  );
}
