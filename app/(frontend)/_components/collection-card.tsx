import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icons";

export function CollectionCard({
  collection,
}: {
  collection: {
    slug: string;
    name: string;
    description: string;
    cover: string;
    wallpaperSlugs: readonly string[];
  };
}) {
  return (
    <article className="collectionCard">
      <Link href={`/collections/${collection.slug}`}>
        <Image
          src={collection.cover}
          alt={`${collection.name} wallpaper collection`}
          fill
          unoptimized
          sizes="(max-width: 700px) 100vw, 50vw"
        />
        <span className="collectionShade" aria-hidden="true" />
        <div>
          <span>{collection.wallpaperSlugs.length} wallpapers</span>
          <h3>{collection.name}</h3>
          <p>{collection.description}</p>
        </div>
        <span className="collectionArrow" aria-hidden="true"><Icon name="arrow" size={20} /></span>
      </Link>
    </article>
  );
}
