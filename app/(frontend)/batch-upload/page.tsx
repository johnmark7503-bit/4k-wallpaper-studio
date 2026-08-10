"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type RelationOption = { id: number; name: string; slug: string };
type SeoPreset = {
  title: string; slug: string; description: string; alt: string; tags: string[]; palette: string;
  focusKeyword: string; metaTitle: string; metaDescription: string; pinterestTitle: string;
  pinterestDescription: string; suggestedCategory?: string;
};
type UploadStatus = "analyzing" | "ready" | "uploading" | "done" | "skipped" | "error";
type UploadItem = SeoPreset & {
  id: string; file: File; preview: string; status: UploadStatus; message?: string;
  categoryId?: number; useCollections: boolean; collectionIds: number[]; url?: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120);
}

function fallbackSEO(file: File): SeoPreset {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const subject = base && !/^(img|image|photo|wallpaper)[-_ ]?\d*$/i.test(base) ? base : "Original Scenic 4K";
  const title = `${subject} Wallpaper`;
  return {
    title, slug: slugify(title),
    description: `An original high-quality wallpaper featuring ${subject.toLowerCase()}, prepared for phone and desktop backgrounds.`,
    alt: `${subject} wallpaper`, tags: ["4K wallpaper", "phone wallpaper", "desktop background"],
    palette: "AI analysis pending", focusKeyword: `${subject.toLowerCase()} wallpaper`,
    metaTitle: title.slice(0, 60), metaDescription: `Download this original ${subject.toLowerCase()} wallpaper for phone and desktop.`.slice(0, 160),
    pinterestTitle: title.slice(0, 100), pinterestDescription: `Save this original ${subject.toLowerCase()} wallpaper for a fresh phone or desktop background.`,
  };
}

async function optimizeImage(file: File, maxDimension = 2560, quality = 0.9) {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
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

const fieldStyle = { width: "100%", border: "1px solid #2a3b46", borderRadius: 10, background: "#050b10", color: "white", padding: 11 } as const;
const labelStyle = { color: "#8fa3af", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" } as const;

export default function BatchUploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [running, setRunning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [categories, setCategories] = useState<RelationOption[]>([]);
  const [collections, setCollections] = useState<RelationOption[]>([]);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number>();
  const [defaultUseCollections, setDefaultUseCollections] = useState(false);
  const [defaultCollectionIds, setDefaultCollectionIds] = useState<number[]>([]);
  const [optionsError, setOptionsError] = useState("");
  const [aiConfigured, setAIConfigured] = useState(false);
  const [aiMessage, setAIMessage] = useState("Checking Google AI Studio connection…");
  const uploaded = useMemo(() => items.filter((item) => item.status === "done").length, [items]);
  const skipped = useMemo(() => items.filter((item) => item.status === "skipped").length, [items]);

  useEffect(() => {
    Promise.all([
      fetch("/cms-api/batch-upload", { credentials: "include" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not load categories and collections.");
        setCategories(result.categories ?? []);
        setCollections(result.collections ?? []);
        const nature = (result.categories ?? []).find((item: RelationOption) => item.slug === "nature");
        if (nature) setDefaultCategoryId(nature.id);
      }),
      fetch("/cms-api/ai/status", { credentials: "include" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not check AI settings.");
        setAIConfigured(Boolean(result.configured && result.enabled));
        setAIMessage(result.configured && result.enabled ? "Google AI is connected. Every selected image will be analyzed automatically." : "Google AI is not connected yet. Add the API key in AI wallpaper settings; uploads can still use editable fallback SEO.");
      }),
    ]).catch((error) => setOptionsError(error instanceof Error ? error.message : "Could not load uploader settings."));
  }, []);

  function matchCategory(name?: string) {
    if (!name) return undefined;
    const wanted = name.toLowerCase();
    return categories.find((category) => category.name.toLowerCase() === wanted || category.slug === slugify(wanted))?.id;
  }

  async function analyzeOne(item: UploadItem) {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "analyzing", message: "AI is analyzing the image and writing SEO…" } : entry));
    try {
      const optimized = await optimizeImage(item.file, 1280, 0.78);
      const base64 = await toBase64(optimized.blob);
      const response = await fetch("/cms-api/ai/analyze-image", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ base64, mimeType: "image/webp" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "AI analysis failed.");
      setItems((current) => current.map((entry) => entry.id === item.id ? {
        ...entry, ...result.seo, categoryId: matchCategory(result.seo.suggestedCategory) ?? entry.categoryId,
        status: "ready", message: "AI SEO ready — review or publish.",
      } : entry));
    } catch (error) {
      setItems((current) => current.map((entry) => entry.id === item.id ? {
        ...entry, status: "ready", message: `${error instanceof Error ? error.message : "AI analysis failed."} Fallback SEO is ready and editable.`,
      } : entry));
    }
  }

  async function analyzeAll(selected: UploadItem[]) {
    if (!aiConfigured || !selected.length) return;
    setAnalyzing(true);
    for (const item of selected) await analyzeOne(item);
    setAnalyzing(false);
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 20);
    const selected = files.map((file, index): UploadItem => ({
      ...fallbackSEO(file), id: `${file.name}-${file.size}-${file.lastModified}-${index}`, file,
      preview: URL.createObjectURL(file), status: aiConfigured ? "analyzing" : "ready",
      message: aiConfigured ? "Waiting for AI analysis…" : "Fallback SEO ready — connect Google AI for visual analysis.",
      categoryId: defaultCategoryId, useCollections: defaultUseCollections,
      collectionIds: defaultUseCollections ? defaultCollectionIds : [],
    }));
    setItems(selected);
    void analyzeAll(selected);
    event.target.value = "";
  }

  function applyDefaults(categoryId: number | undefined, useCollections: boolean, collectionIds: number[]) {
    setItems((current) => current.map((item) => ["done", "skipped"].includes(item.status) ? item : {
      ...item, categoryId, useCollections, collectionIds: useCollections ? collectionIds : [],
    }));
  }

  function updateItem(id: string, values: Partial<UploadItem>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
  }

  function updateTitle(id: string, title: string) {
    updateItem(id, { title, slug: slugify(title), metaTitle: title.slice(0, 60), pinterestTitle: title.slice(0, 100) });
  }

  async function uploadAll() {
    if (!items.length || running || analyzing) return;
    setRunning(true);
    for (const selected of items) {
      if (["done", "skipped"].includes(selected.status)) continue;
      updateItem(selected.id, { status: "uploading", message: "Uploading to media storage and verifying CMS record…" });
      try {
        const optimized = await optimizeImage(selected.file);
        const base64 = await toBase64(optimized.blob);
        const response = await fetch("/cms-api/batch-upload", {
          method: "POST", credentials: "include", headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...selected, file: undefined, preview: undefined, status: undefined, id: undefined,
            filename: selected.file.name, mimeType: "image/webp", base64, width: optimized.width, height: optimized.height,
            collectionIds: selected.useCollections ? selected.collectionIds : [],
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.verified) throw new Error(result.error ?? "CMS could not verify the published wallpaper.");
        updateItem(selected.id, {
          status: result.skipped ? "skipped" : "done", slug: result.slug ?? selected.slug, url: result.url,
          message: result.skipped ? "Exact same image was already published — no false upload count." : result.message ?? "Published and verified on the website.",
        });
      } catch (error) {
        updateItem(selected.id, { status: "error", message: error instanceof Error ? error.message : "Upload failed." });
      }
    }
    setRunning(false);
  }

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px 80px", background: "#050b10", color: "#f6fbff" }}>
      <section style={{ width: "min(1180px, 100%)", margin: "0 auto" }}>
        <p className="eyebrow">AI administrator utility</p>
        <h1 style={{ marginTop: 12, fontSize: "clamp(34px, 5vw, 58px)", letterSpacing: "-0.04em" }}>Batch upload wallpapers</h1>
        <p style={{ marginTop: 14, maxWidth: 800, color: "#9fb0bb", lineHeight: 1.7 }}>Select up to 20 original images. Google AI analyzes each image, prepares accurate SEO, and the uploader verifies that every new wallpaper is actually published.</p>

        <div style={{ marginTop: 22, padding: 16, border: `1px solid ${aiConfigured ? "#2f6149" : "#5a4b27"}`, borderRadius: 14, background: aiConfigured ? "#0a1a15" : "#18150c", color: "#c8d5dc", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <span>{aiMessage}</span>
          <span style={{ display: "flex", gap: 14 }}><Link href="/studio/globals/ai-settings" style={{ color: "#e6ff45", fontWeight: 800 }}>AI settings</Link><Link href="/ai-studio" style={{ color: "#75ddff", fontWeight: 800 }}>Open AI Studio</Link></span>
        </div>

        <div style={{ marginTop: 22, padding: 18, border: "1px solid #20313b", borderRadius: 16, background: "#09131a", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          <label style={{ color: "#9fb0bb", fontSize: 13, fontWeight: 700 }}>Category — apply to all
            <select value={defaultCategoryId ?? ""} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : undefined; setDefaultCategoryId(value); applyDefaults(value, defaultUseCollections, defaultCollectionIds); }} style={{ ...fieldStyle, marginTop: 8 }}>
              <option value="">Select a category</option>{categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </label>
          <div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#f6fbff", fontWeight: 800 }}>
              <input type="checkbox" checked={defaultUseCollections} onChange={(event) => { const checked = event.target.checked; setDefaultUseCollections(checked); applyDefaults(defaultCategoryId, checked, defaultCollectionIds); }} />
              Add to collection(s) — optional
            </label>
            {defaultUseCollections ? <select aria-label="Collections apply to all" multiple value={defaultCollectionIds.map(String)} onChange={(event) => { const values = Array.from(event.target.selectedOptions, (option) => Number(option.value)); setDefaultCollectionIds(values); applyDefaults(defaultCategoryId, true, values); }} style={{ ...fieldStyle, marginTop: 10, minHeight: 96 }}>
              {collections.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select> : <p style={{ marginTop: 10, color: "#748893", fontSize: 13 }}>Off — images will publish without any collection.</p>}
          </div>
        </div>
        {optionsError && <p style={{ marginTop: 12, color: "#ff8c8c" }}>{optionsError}</p>}

        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <label style={{ display: "inline-flex", cursor: "pointer", padding: "13px 18px", borderRadius: 999, background: "#e6ff45", color: "#071017", fontWeight: 800 }}>Select images
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={selectFiles} style={{ display: "none" }} />
          </label>
          <button type="button" onClick={uploadAll} disabled={!items.length || running || analyzing} style={{ border: "1px solid #2a3b46", padding: "13px 18px", borderRadius: 999, background: running || analyzing ? "#16232b" : "#0d1b23", color: "white", fontWeight: 800, cursor: running || analyzing ? "wait" : "pointer", opacity: !items.length ? 0.5 : 1 }}>
            {analyzing ? "AI analyzing images…" : running ? "Publishing and verifying…" : `Publish ${items.length || ""} wallpapers`}
          </button>
          {items.length > 0 && <span style={{ color: "#9fb0bb" }}>{uploaded} published{skipped ? ` · ${skipped} exact duplicate${skipped === 1 ? "" : "s"}` : ""}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 18, marginTop: 34 }}>
          {items.map((item) => {
            const locked = running || ["done", "skipped"].includes(item.status);
            return <article key={item.id} style={{ overflow: "hidden", border: "1px solid #20313b", borderRadius: 20, background: "#09131a" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="Selected wallpaper preview" style={{ width: "100%", aspectRatio: "9 / 16", objectFit: "cover", display: "block" }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "grid", gap: 11, marginBottom: 14 }}>
                  <label style={labelStyle}>Category<select value={item.categoryId ?? ""} disabled={locked} onChange={(event) => updateItem(item.id, { categoryId: event.target.value ? Number(event.target.value) : undefined })} style={{ ...fieldStyle, marginTop: 8 }}><option value="">Select a category</option>{categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                  <label style={{ display: "flex", gap: 9, alignItems: "center", color: "#c8d5dc", fontSize: 13, fontWeight: 700 }}><input type="checkbox" checked={item.useCollections} disabled={locked} onChange={(event) => updateItem(item.id, { useCollections: event.target.checked, collectionIds: event.target.checked ? item.collectionIds : [] })} />Add this image to collection(s)</label>
                  {item.useCollections && <select aria-label="Collections" multiple value={item.collectionIds.map(String)} disabled={locked} onChange={(event) => updateItem(item.id, { collectionIds: Array.from(event.target.selectedOptions, (option) => Number(option.value)) })} style={{ ...fieldStyle, minHeight: 82 }}>{collections.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>}
                </div>
                <label style={labelStyle}>SEO title</label>
                <textarea value={item.title} disabled={locked} onChange={(event) => updateTitle(item.id, event.target.value)} rows={3} style={{ ...fieldStyle, marginTop: 8, resize: "vertical", lineHeight: 1.4 }} />
                <p style={{ marginTop: 10, fontSize: 12, color: "#748893", overflowWrap: "anywhere" }}>/wallpapers/{item.slug}</p>
                <p style={{ marginTop: 12, color: item.status === "error" ? "#ff8c8c" : item.status === "done" ? "#b9ff7a" : item.status === "analyzing" ? "#75ddff" : "#9fb0bb", fontSize: 13 }}>{item.message}</p>
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, color: "#e6ff45", fontWeight: 800 }}>View published wallpaper ↗</a>}
                {aiConfigured && !locked && item.status !== "analyzing" && <button type="button" onClick={() => void analyzeOne(item)} style={{ marginTop: 12, border: 0, background: "transparent", color: "#75ddff", cursor: "pointer", fontWeight: 800 }}>Analyze again with AI</button>}
              </div>
            </article>;
          })}
        </div>
        {!items.length && <div style={{ marginTop: 36, padding: "48px 24px", border: "1px dashed #2a3b46", borderRadius: 20, textAlign: "center", color: "#78909c" }}>Selected images and AI-generated SEO will appear here.</div>}
      </section>
    </main>
  );
}
