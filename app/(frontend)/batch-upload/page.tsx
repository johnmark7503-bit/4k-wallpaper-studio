"use client";

import { ChangeEvent, useMemo, useState } from "react";

type SeoPreset = {
  title: string;
  slug: string;
  description: string;
  alt: string;
  tags: string[];
  palette: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  pinterestTitle: string;
  pinterestDescription: string;
};

type UploadItem = SeoPreset & {
  id: string;
  file: File;
  preview: string;
  status: "ready" | "uploading" | "done" | "skipped" | "error";
  message?: string;
};

const PRESETS: Record<number, SeoPreset> = {
  1: {
    title: "Tropical Waterfall in Green Rainforest Phone Wallpaper",
    slug: "tropical-waterfall-green-rainforest-wallpaper",
    description: "A peaceful tropical waterfall flowing into a crystal-clear emerald pool, surrounded by lush rainforest greenery and soft natural light. A calming vertical nature wallpaper for phones.",
    alt: "Tropical waterfall flowing into a clear green rainforest pool",
    tags: ["waterfall wallpaper", "rainforest", "tropical nature", "green wallpaper", "phone background"],
    palette: "emerald green, turquoise, white",
    focusKeyword: "tropical waterfall wallpaper",
    metaTitle: "Tropical Waterfall Rainforest Phone Wallpaper",
    metaDescription: "Download a peaceful tropical waterfall phone wallpaper with lush rainforest greenery and a crystal-clear emerald pool.",
    pinterestTitle: "Tropical Waterfall in Green Rainforest Wallpaper",
    pinterestDescription: "Refresh your phone with a peaceful tropical waterfall, lush rainforest greenery and a crystal-clear emerald pool. Save this calming vertical nature wallpaper.",
  },
  2: {
    title: "Full Moon Lake and Fireflies Night Phone Wallpaper",
    slug: "full-moon-lake-fireflies-night-wallpaper",
    description: "A luminous full moon reflected across a quiet blue lake while tiny fireflies glow between shadowy trees. This dreamy vertical night wallpaper brings calm moonlit atmosphere to your phone.",
    alt: "Full moon reflected on a quiet lake with glowing fireflies",
    tags: ["moon wallpaper", "night lake", "fireflies", "blue wallpaper", "phone background"],
    palette: "midnight blue, silver, teal",
    focusKeyword: "full moon lake wallpaper",
    metaTitle: "Full Moon Lake and Fireflies Phone Wallpaper",
    metaDescription: "Download a dreamy full moon lake wallpaper with silver reflections, deep blue trees and glowing fireflies for your phone.",
    pinterestTitle: "Full Moon Lake and Fireflies Night Wallpaper",
    pinterestDescription: "A peaceful moonlit lake, silver reflections and glowing fireflies create the perfect dreamy night phone background. Save this calming nature wallpaper.",
  },
  3: {
    title: "Golden Sunrise Over Misty Mountains Phone Wallpaper",
    slug: "golden-sunrise-misty-mountains-wallpaper",
    description: "Golden sunrise light breaks over dramatic mountain peaks and a winding ridge trail above soft clouds. A cinematic vertical mountain wallpaper for an inspiring phone background.",
    alt: "Golden sunrise over misty mountain peaks and a ridge trail",
    tags: ["mountain wallpaper", "sunrise", "misty mountains", "golden hour", "phone background"],
    palette: "gold, slate blue, warm gray",
    focusKeyword: "sunrise mountain wallpaper",
    metaTitle: "Golden Sunrise Misty Mountains Phone Wallpaper",
    metaDescription: "Download a cinematic sunrise mountain wallpaper with golden light, misty peaks and an inspiring ridge trail for your phone.",
    pinterestTitle: "Golden Sunrise Over Misty Mountains Wallpaper",
    pinterestDescription: "Start every day with golden sunrise light, dramatic misty peaks and a cinematic mountain trail. Save this inspiring vertical phone wallpaper.",
  },
  4: {
    title: "Magical Purple Sunset River Fantasy Phone Wallpaper",
    slug: "magical-purple-sunset-river-wallpaper",
    description: "A glowing turquoise river winds through a purple mountain valley beneath a vivid pink and violet sunset. A magical fantasy-inspired landscape wallpaper designed for vertical phone screens.",
    alt: "Glowing river through purple mountains beneath a vivid sunset",
    tags: ["purple wallpaper", "sunset river", "fantasy landscape", "mountain valley", "phone background"],
    palette: "violet, magenta, turquoise",
    focusKeyword: "purple sunset river wallpaper",
    metaTitle: "Magical Purple Sunset River Phone Wallpaper",
    metaDescription: "Download a magical purple sunset river wallpaper with turquoise water, violet mountains and a dreamy fantasy atmosphere.",
    pinterestTitle: "Magical Purple Sunset River Fantasy Wallpaper",
    pinterestDescription: "A glowing turquoise river meets violet mountains and a dreamy pink sunset. Save this magical fantasy landscape as your next vertical phone wallpaper.",
  },
  5: {
    title: "Mountain Lake Sunrise Reflection Phone Wallpaper",
    slug: "mountain-lake-sunrise-reflection-wallpaper",
    description: "Warm sunrise colors illuminate a rugged mountain and reflect across a still alpine lake framed by pine trees and wildflowers. A crisp scenic phone wallpaper for nature lovers.",
    alt: "Sunrise mountain reflected in a calm alpine lake",
    tags: ["mountain lake wallpaper", "sunrise reflection", "alpine scenery", "nature wallpaper", "phone background"],
    palette: "peach, blue, forest green",
    focusKeyword: "mountain lake sunrise wallpaper",
    metaTitle: "Mountain Lake Sunrise Reflection Phone Wallpaper",
    metaDescription: "Download a scenic mountain lake sunrise wallpaper with warm reflections, pine trees and peaceful alpine beauty.",
    pinterestTitle: "Mountain Lake Sunrise Reflection Wallpaper",
    pinterestDescription: "Warm sunrise colors reflect across a peaceful alpine lake beneath a dramatic mountain peak. Save this crisp nature phone wallpaper for daily inspiration.",
  },
  6: {
    title: "Moonlit Hillside Village Stairway Phone Wallpaper",
    slug: "moonlit-hillside-village-stairway-wallpaper",
    description: "A lantern-lit stone stairway climbs through a flower-filled hillside village beneath a dreamy moonlit sky. This enchanting vertical wallpaper blends cozy cottage atmosphere with magical night scenery.",
    alt: "Lantern-lit village stairway with flowers beneath a moonlit sky",
    tags: ["village wallpaper", "moonlit night", "cottage scenery", "flower stairway", "phone background"],
    palette: "teal, amber, garden green",
    focusKeyword: "moonlit village wallpaper",
    metaTitle: "Moonlit Hillside Village Stairway Wallpaper",
    metaDescription: "Download an enchanting moonlit village wallpaper with a lantern-lit stone stairway, flowers and cozy hillside homes.",
    pinterestTitle: "Moonlit Hillside Village Stairway Wallpaper",
    pinterestDescription: "Walk into a dreamy hillside village where warm lanterns, flower-lined steps and a moonlit sky create a cozy magical phone background.",
  },
  7: {
    title: "Sunny Alpine Valley and Waterfall Phone Wallpaper",
    slug: "sunny-alpine-valley-waterfall-wallpaper",
    description: "Sunbeams pour into a green alpine valley where a clear stream and small waterfalls flow between wildflowers beneath towering peaks. A bright and refreshing vertical nature wallpaper.",
    alt: "Sunny green alpine valley with stream waterfalls and wildflowers",
    tags: ["alpine valley wallpaper", "waterfall", "mountain meadow", "sunbeams", "phone background"],
    palette: "fresh green, sky blue, sunlight gold",
    focusKeyword: "alpine valley waterfall wallpaper",
    metaTitle: "Sunny Alpine Valley Waterfall Phone Wallpaper",
    metaDescription: "Download a sunny alpine valley wallpaper with clear waterfalls, green meadows, wildflowers and dramatic mountain peaks.",
    pinterestTitle: "Sunny Alpine Valley and Waterfall Wallpaper",
    pinterestDescription: "Bright sunbeams, clear waterfalls, green meadows and towering alpine peaks make this a refreshing nature wallpaper for your phone.",
  },
  8: {
    title: "Golden Autumn Forest Path Phone Wallpaper",
    slug: "golden-autumn-forest-path-wallpaper",
    description: "A quiet woodland path covered in orange leaves glows beneath warm sunbeams filtering through tall autumn trees. A cozy vertical forest wallpaper with rich seasonal color.",
    alt: "Golden autumn forest path covered in orange leaves and sunbeams",
    tags: ["autumn wallpaper", "forest path", "fall leaves", "golden forest", "phone background"],
    palette: "burnt orange, gold, warm brown",
    focusKeyword: "autumn forest path wallpaper",
    metaTitle: "Golden Autumn Forest Path Phone Wallpaper",
    metaDescription: "Download a cozy golden autumn forest wallpaper with warm sunbeams, orange leaves and a peaceful woodland path.",
    pinterestTitle: "Golden Autumn Forest Path Wallpaper",
    pinterestDescription: "Warm sunlight streams through tall trees onto a peaceful path covered in golden-orange leaves. Save this cozy autumn phone wallpaper.",
  },
  9: {
    title: "Emerald Pine Forest Lake Phone Wallpaper",
    slug: "emerald-pine-forest-lake-wallpaper",
    description: "A hidden emerald lake shines through towering pine trees with misty mountain peaks in the distance. This immersive vertical wallpaper captures the quiet beauty of a deep forest escape.",
    alt: "Hidden emerald lake surrounded by pine forest and misty mountains",
    tags: ["pine forest wallpaper", "emerald lake", "mountain forest", "green nature", "phone background"],
    palette: "deep green, emerald, mist blue",
    focusKeyword: "pine forest lake wallpaper",
    metaTitle: "Emerald Pine Forest Lake Phone Wallpaper",
    metaDescription: "Download an emerald pine forest lake wallpaper with towering trees, misty mountains and a peaceful hidden nature escape.",
    pinterestTitle: "Emerald Pine Forest Lake Wallpaper",
    pinterestDescription: "Escape into a deep pine forest where an emerald lake glows beneath misty mountain peaks. Save this immersive green nature wallpaper for your phone.",
  },
  10: {
    title: "Cherry Blossoms and Mount Fuji Phone Wallpaper",
    slug: "cherry-blossoms-mount-fuji-wallpaper",
    description: "Pink cherry blossoms frame a peaceful path leading toward Mount Fuji beneath a soft pastel sky. A serene Japanese spring landscape wallpaper made for vertical phone screens.",
    alt: "Pink cherry blossoms framing Mount Fuji and a peaceful spring path",
    tags: ["cherry blossom wallpaper", "Mount Fuji", "Japan scenery", "sakura", "phone background"],
    palette: "sakura pink, lavender, mountain blue",
    focusKeyword: "cherry blossoms Mount Fuji wallpaper",
    metaTitle: "Cherry Blossoms Mount Fuji Phone Wallpaper",
    metaDescription: "Download a serene cherry blossom and Mount Fuji wallpaper with a peaceful spring path and soft pastel Japanese scenery.",
    pinterestTitle: "Cherry Blossoms and Mount Fuji Wallpaper",
    pinterestDescription: "Pink sakura blossoms frame a peaceful path toward Mount Fuji beneath a dreamy pastel sky. Save this serene Japanese spring phone wallpaper.",
  },
};

function slugify(value: string) {
  return value.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function presetFor(file: File): SeoPreset {
  const match = file.name.match(/\((\d+)\)\.(?:png|jpe?g|webp)$/i);
  const preset = match ? PRESETS[Number(match[1])] : undefined;
  if (preset) return preset;
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  const title = `${base || "Nature Landscape"} Phone Wallpaper`;
  return {
    title,
    slug: slugify(title),
    description: `A high-quality vertical nature wallpaper featuring ${base.toLowerCase() || "a scenic landscape"}, created for a clean and immersive phone background.`,
    alt: `${base || "Scenic nature landscape"} vertical phone wallpaper`,
    tags: ["nature wallpaper", "phone wallpaper", "vertical background"],
    palette: "natural colors",
    focusKeyword: `${base.toLowerCase() || "nature"} wallpaper`,
    metaTitle: title.slice(0, 60),
    metaDescription: `Download this high-quality ${base.toLowerCase() || "nature"} phone wallpaper for a clean vertical background.`.slice(0, 160),
    pinterestTitle: title,
    pinterestDescription: `Save this high-quality ${base.toLowerCase() || "nature"} vertical wallpaper for a fresh phone background.`,
  };
}

async function optimizeImage(file: File) {
  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this image.");
  context.drawImage(image, 0, 0);
  image.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  if (!blob) throw new Error("Image optimization failed.");
  return { blob, width: canvas.width, height: canvas.height };
}

function toBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read the optimized image."));
    reader.readAsDataURL(blob);
  });
}

export default function BatchUploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [running, setRunning] = useState(false);
  const complete = useMemo(() => items.filter((item) => item.status === "done" || item.status === "skipped").length, [items]);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 20);
    setItems(files.map((file) => ({ ...presetFor(file), id: `${file.name}-${file.lastModified}`, file, preview: URL.createObjectURL(file), status: "ready" })));
  }

  function updateTitle(id: string, title: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, title, slug: slugify(title), metaTitle: title.slice(0, 60), pinterestTitle: title.slice(0, 100) } : item));
  }

  async function uploadAll() {
    if (!items.length || running) return;
    setRunning(true);
    for (const selected of items) {
      if (["done", "skipped"].includes(selected.status)) continue;
      setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: "uploading", message: "Optimizing and uploading…" } : item));
      try {
        const optimized = await optimizeImage(selected.file);
        const base64 = await toBase64(optimized.blob);
        const response = await fetch("/cms-api/batch-upload", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...selected, file: undefined, preview: undefined, status: undefined, id: undefined, filename: selected.file.name, mimeType: "image/webp", base64, width: optimized.width, height: optimized.height }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Upload failed.");
        setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: result.skipped ? "skipped" : "done", message: result.skipped ? "Already exists — skipped safely." : "Published with SEO." } : item));
      } catch (error) {
        setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: "error", message: error instanceof Error ? error.message : "Upload failed." } : item));
      }
    }
    setRunning(false);
  }

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px 80px", background: "#050b10", color: "#f6fbff" }}>
      <section style={{ width: "min(1120px, 100%)", margin: "0 auto" }}>
        <p className="eyebrow">Administrator utility</p>
        <h1 style={{ marginTop: 12, fontSize: "clamp(34px, 5vw, 58px)", letterSpacing: "-0.04em" }}>Batch upload wallpapers</h1>
        <p style={{ marginTop: 14, maxWidth: 760, color: "#9fb0bb", lineHeight: 1.7 }}>Select up to 20 original images. Files are optimized in your browser, uploaded one at a time, assigned to Nature, published, and completed with search and Pinterest SEO.</p>

        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <label style={{ display: "inline-flex", cursor: "pointer", padding: "13px 18px", borderRadius: 999, background: "#e6ff45", color: "#071017", fontWeight: 800 }}>
            Select images
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={selectFiles} style={{ display: "none" }} />
          </label>
          <button type="button" onClick={uploadAll} disabled={!items.length || running} style={{ border: "1px solid #2a3b46", padding: "13px 18px", borderRadius: 999, background: running ? "#16232b" : "#0d1b23", color: "white", fontWeight: 800, cursor: running ? "wait" : "pointer", opacity: !items.length ? 0.5 : 1 }}>
            {running ? `Uploading ${complete + 1} of ${items.length}…` : `Publish ${items.length || ""} wallpapers`}
          </button>
          {items.length > 0 && <span style={{ color: "#9fb0bb" }}>{complete}/{items.length} complete</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 18, marginTop: 34 }}>
          {items.map((item) => (
            <article key={item.id} style={{ overflow: "hidden", border: "1px solid #20313b", borderRadius: 20, background: "#09131a" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="Selected wallpaper preview" style={{ width: "100%", aspectRatio: "9 / 16", objectFit: "cover", display: "block" }} />
              <div style={{ padding: 16 }}>
                <label style={{ display: "block", color: "#8fa3af", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>SEO title</label>
                <textarea value={item.title} disabled={running || item.status === "done"} onChange={(event) => updateTitle(item.id, event.target.value)} rows={3} style={{ marginTop: 8, width: "100%", resize: "vertical", border: "1px solid #2a3b46", borderRadius: 10, background: "#050b10", color: "white", padding: 11, lineHeight: 1.4 }} />
                <p style={{ marginTop: 10, fontSize: 12, color: "#748893", overflowWrap: "anywhere" }}>/wallpapers/{item.slug}</p>
                <p style={{ marginTop: 12, color: item.status === "error" ? "#ff8c8c" : item.status === "done" ? "#b9ff7a" : "#9fb0bb", fontSize: 13 }}>{item.message ?? "SEO ready — review the title if needed."}</p>
              </div>
            </article>
          ))}
        </div>

        {!items.length && <div style={{ marginTop: 36, padding: "48px 24px", border: "1px dashed #2a3b46", borderRadius: 20, textAlign: "center", color: "#78909c" }}>Your selected wallpapers and generated SEO titles will appear here.</div>}
        <p style={{ marginTop: 24, color: "#74838d", fontSize: 14 }}>You must be logged into /studio as an Administrator or Editor. Duplicate URL slugs are skipped, so Retry is safe.</p>
      </section>
    </main>
  );
}
