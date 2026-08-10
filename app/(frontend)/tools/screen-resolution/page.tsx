import type { Metadata } from "next";
import { PageHero, PageShell } from "../../_components/page-shell";
import { ScreenResolutionChecker } from "./screen-resolution-checker";

export const metadata: Metadata = {
  title: "Screen Resolution Checker",
  description: "Check your browser viewport, pixel ratio and recommended wallpaper resolution.",
};

export default function ScreenResolutionPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Private browser tool" title="Screen resolution checker" description="See your viewport, display estimate and a practical wallpaper recommendation. No device data is uploaded." />
      <section className="contentShell toolWorkspaceSection"><ScreenResolutionChecker /></section>
    </PageShell>
  );
}
