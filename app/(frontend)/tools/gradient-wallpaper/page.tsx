import type { Metadata } from "next";
import { PageHero, PageShell } from "../../_components/page-shell";
import { GradientWallpaperMaker } from "./gradient-wallpaper-maker";

export const metadata: Metadata = {
  title: "4K Gradient Wallpaper Maker",
  description: "Create and download a custom 4K gradient wallpaper in your browser.",
};

export default function GradientWallpaperPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Free studio tool" title="Gradient wallpaper maker" description="Choose two colors, set the direction and download a clean desktop or phone wallpaper." />
      <section className="contentShell toolWorkspaceSection"><GradientWallpaperMaker /></section>
    </PageShell>
  );
}
