import Image from "next/image";
import Link from "next/link";
import type { Wallpaper } from "../_data/site-data";
import { Icon } from "./icons";
import { SaveButton } from "./save-button";

export function WallpaperCard({
  wallpaper,
  priority = false,
}: {
  wallpaper: Wallpaper;
  priority?: boolean;
}) {
  return (
    <article className="wallpaperCard">
      <div className="wallpaperImage">
        <Link href={`/wallpapers/${wallpaper.slug}`} aria-label={`Open ${wallpaper.title}`}>
          <Image
            src={wallpaper.src}
            alt={wallpaper.alt}
            fill
            unoptimized
            priority={priority}
            sizes="(max-width: 680px) 100vw, (max-width: 1080px) 50vw, 33vw"
          />
          <span className="resolutionBadge">4 sizes</span>
        </Link>
        <SaveButton slug={wallpaper.slug} compact />
      </div>
      <div className="wallpaperMeta">
        <Link href={`/wallpapers/${wallpaper.slug}`}>
          <h3>{wallpaper.title}</h3>
          <p>{wallpaper.category} · Phone, Tablet, Laptop &amp; 4K</p>
        </Link>
        <Link className="roundAction" href={`/wallpapers/${wallpaper.slug}`} aria-label={`Download ${wallpaper.title}`}>
          <Icon name="download" size={18} />
        </Link>
      </div>
    </article>
  );
}
