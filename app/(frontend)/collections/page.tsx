import type { Metadata } from "next";
import { CollectionCard } from "../_components/collection-card";
import { PageHero, PageShell } from "../_components/page-shell";
import { getCollectionsData } from "../_data/cms-data";

export const metadata: Metadata = {
  title: "Curated 4K Wallpaper Collections",
  description: "Explore complete original wallpaper collections curated by mood, palette and visual style.",
};

export default async function CollectionsPage() {
  const collections = await getCollectionsData();
  return (
    <PageShell>
      <PageHero eyebrow="Complete screen stories" title="Curated collections" description="Coherent groups of original wallpapers for desktops, phones and focused setups." />
      <section className="contentShell collectionGrid collectionIndexGrid">
        {collections.map((collection) => <CollectionCard collection={collection} key={collection.slug} />)}
      </section>
    </PageShell>
  );
}
