"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WallpaperCard } from "../_components/wallpaper-card";
import { wallpapers } from "../_data/site-data";

const storageKey = "4k-wallpaper-studio-saved:v1";

export function SavedWallpapers() {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    function refresh() {
      try { setSlugs(JSON.parse(window.localStorage.getItem(storageKey) || "[]") as string[]); }
      catch { setSlugs([]); }
    }
    refresh();
    window.addEventListener("wallpaper-saved-change", refresh);
    return () => window.removeEventListener("wallpaper-saved-change", refresh);
  }, []);

  if (slugs === null) return <div className="emptyState"><h2>Loading saved wallpapers…</h2></div>;
  const savedSlugs = new Set(slugs);
  const saved = wallpapers.filter((wallpaper) => savedSlugs.has(wallpaper.slug));
  if (!saved.length) return <div className="emptyState"><h2>No saved wallpapers yet</h2><p>Tap the heart on any wallpaper to keep it here on this device.</p><Link className="primaryButton" href="/explore">Explore wallpapers</Link></div>;
  return <div className="wallpaperGrid">{saved.map((wallpaper) => <WallpaperCard wallpaper={wallpaper} key={wallpaper.slug} />)}</div>;
}
