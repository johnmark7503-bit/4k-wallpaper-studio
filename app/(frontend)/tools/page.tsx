import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";
import { tools } from "../_data/site-data";

export const metadata: Metadata = {
  title: "Free Wallpaper Tools",
  description: "Create name and gradient wallpapers or check the best resolution for your screen.",
};

export default function ToolsPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Useful creative tools" title="Wallpaper tools that do something useful" description="Create an original AI name wallpaper through secure processing, or use private in-browser tools for gradients and screen sizing." />
      <section className="contentShell toolsIndexGrid">
        {tools.map((tool, index) => (
          <article className="toolIndexCard" key={tool.slug}>
            <span>0{index + 1}</span>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <Link className="textLink" href={`/tools/${tool.slug}`}>{tool.label} <Icon name="arrow" size={18} /></Link>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
