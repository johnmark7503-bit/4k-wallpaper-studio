import type { Metadata } from "next";
import { PageHero, PageShell } from "../../_components/page-shell";
import { NameWallpaperGenerator } from "./name-wallpaper-generator";

export const metadata: Metadata = {
  title: "AI Name Wallpaper Generator",
  description:
    "Type your name and create an original AI wallpaper with four high-resolution downloads for phone, tablet, laptop and desktop.",
};

export default function NameWallpaperPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Gemini personal wallpaper studio"
        title="Your name. One original world."
        description="Type only your name. Gemini transforms it into a different premium visual world on every generation, then the studio adds perfectly spelled typography for every screen."
      />
      <section className="contentShell toolWorkspaceSection">
        <NameWallpaperGenerator />
      </section>
    </PageShell>
  );
}
