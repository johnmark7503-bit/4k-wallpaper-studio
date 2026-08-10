"use client";

import { useState } from "react";
import { trackFirebaseEvent } from "./firebase-analytics";

export function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [label, setLabel] = useState("Share");

  async function share() {
    const url = `${window.location.origin}/wallpapers/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        trackFirebaseEvent("share", { content_type: "wallpaper", item_id: slug, method: "native" });
        return;
      }
      await navigator.clipboard.writeText(url);
      setLabel("Link copied");
      trackFirebaseEvent("share", { content_type: "wallpaper", item_id: slug, method: "clipboard" });
      window.setTimeout(() => setLabel("Share"), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      trackFirebaseEvent("share_failed", { content_type: "wallpaper", item_id: slug });
    }
  }

  return (
    <button className="saveButton" type="button" onClick={() => void share()}>
      <span>{label}</span>
    </button>
  );
}
