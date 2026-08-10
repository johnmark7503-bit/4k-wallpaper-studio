"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export function RandomWallpaperLink({ slugs }: { slugs: string[] }) {
  const router = useRouter();

  function openRandom() {
    const index = Math.floor(Math.random() * slugs.length);
    router.push(`/wallpapers/${slugs[index]}`);
  }

  return (
    <button className="browseTab" type="button" onClick={openRandom}>
      <Icon name="shuffle" size={17} /> Random
    </button>
  );
}
