"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./icons";
import { trackFirebaseEvent } from "./firebase-analytics";

const storageKey = "4k-wallpaper-studio-saved:v1";

function readSaved() {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function subscribeToSaved(callback: () => void) {
  window.addEventListener("wallpaper-saved-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("wallpaper-saved-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function SaveButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const saved = useSyncExternalStore(
    subscribeToSaved,
    () => readSaved().includes(slug),
    () => false,
  );

  function toggleSaved() {
    const current = readSaved();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      return;
    }
    window.dispatchEvent(new CustomEvent("wallpaper-saved-change"));
    trackFirebaseEvent(saved ? "wallpaper_unsave" : "wallpaper_save", {
      wallpaper_slug: slug,
    });
    trackFirebaseEvent(saved ? "wallpaper_unlike" : "wallpaper_like", {
      wallpaper_slug: slug,
    });
  }

  return (
    <button
      className={`saveButton ${saved ? "isSaved" : ""} ${compact ? "saveButtonCompact" : ""}`}
      type="button"
      onClick={toggleSaved}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved wallpapers" : "Save wallpaper"}
    >
      <Icon name="heart" size={compact ? 18 : 20} />
      {compact ? null : <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
