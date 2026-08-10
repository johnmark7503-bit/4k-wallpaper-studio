"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RelationOption = { id: number; name: string; slug: string };
type WallpaperResult = {
  image: { base64: string; mimeType: string };
  seo: Record<string, string | string[]> & { title: string; slug: string; description: string; alt: string; tags: string[] };
};
type BlogResult = { title: string; excerpt: string; category: string; sections: Array<{ heading: string; paragraphs: string[] }> };
type NewsletterResult = { subject: string; previewText: string; heading: string; paragraphs: string[]; ctaLabel: string; ctaUrl: string; plainText: string };

const inputStyle = { width: "100%", border: "1px solid #2a3b46", borderRadius: 12, background: "#050b10", color: "white", padding: 13, lineHeight: 1.5 } as const;
const buttonStyle = { border: 0, borderRadius: 999, background: "#e6ff45", color: "#071017", padding: "13px 18px", fontWeight: 900, cursor: "pointer" } as const;

async function api(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: body ? "POST" : "GET", credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Request failed.");
  return result;
}

export default function AIStudioPage() {
  const [tab, setTab] = useState<"wallpaper" | "blog" | "newsletter">("wallpaper");
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState("Checking AI connection…");
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState<RelationOption[]>([]);
  const [collections, setCollections] = useState<RelationOption[]>([]);
  const [categoryId, setCategoryId] = useState<number>();
  const [useCollections, setUseCollections] = useState(false);
  const [collectionIds, setCollectionIds] = useState<number[]>([]);
  const [wallpaperPrompt, setWallpaperPrompt] = useState("A serene cinematic mountain lake at blue hour, mist between pine trees, detailed reflections, premium vertical phone wallpaper");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [wallpaper, setWallpaper] = useState<WallpaperResult>();
  const [publishedUrl, setPublishedUrl] = useState("");
  const [blogTopic, setBlogTopic] = useState("How to choose the perfect wallpaper for an AMOLED phone screen");
  const [blog, setBlog] = useState<BlogResult>();
  const [blogEditUrl, setBlogEditUrl] = useState("");
  const [newsletterTopic, setNewsletterTopic] = useState("This week’s newest nature and AMOLED wallpaper collection");
  const [newsletter, setNewsletter] = useState<NewsletterResult>();
  const [subscribers, setSubscribers] = useState<number>();

  useEffect(() => {
    Promise.all([api("/cms-api/ai/status"), api("/cms-api/batch-upload")])
      .then(([status, options]) => {
        setConfigured(Boolean(status.configured && status.enabled));
        setMessage(status.configured && status.enabled ? `Google AI connected · ${status.imageSize} wallpaper output` : "Add your Google AI Studio API key to activate all AI tools.");
        setCategories(options.categories ?? []); setCollections(options.collections ?? []);
        const nature = (options.categories ?? []).find((item: RelationOption) => item.slug === "nature");
        if (nature) setCategoryId(nature.id);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load AI Studio."));
  }, []);

  async function generateWallpaper() {
    setBusy(true); setPublishedUrl("");
    try { const result = await api("/cms-api/ai/generate-wallpaper", { prompt: wallpaperPrompt, aspectRatio }); setWallpaper(result); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Wallpaper generation failed."); }
    finally { setBusy(false); }
  }

  async function publishWallpaper() {
    if (!wallpaper) return;
    setBusy(true);
    try {
      const result = await api("/cms-api/batch-upload", {
        ...wallpaper.seo, base64: wallpaper.image.base64, mimeType: wallpaper.image.mimeType,
        filename: `${wallpaper.seo.slug}.png`, categoryId, collectionIds: useCollections ? collectionIds : [],
        width: aspectRatio === "16:9" ? 2048 : 1152, height: aspectRatio === "16:9" ? 1152 : 2048,
      });
      setPublishedUrl(result.url); setMessage(result.message ?? "AI wallpaper published and verified.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Publish failed."); }
    finally { setBusy(false); }
  }

  async function generateBlog() {
    setBusy(true); setBlogEditUrl("");
    try {
      const result = await api("/cms-api/ai/blog", { topic: blogTopic, saveDraft: true, generateCover: true });
      setBlog(result.draft); if (result.editUrl) setBlogEditUrl(result.editUrl);
      setMessage(result.saved ? "Blog copy, SEO and AI cover saved as a CMS draft." : result.warning ?? "Blog package generated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Blog generation failed."); }
    finally { setBusy(false); }
  }

  async function generateNewsletter() {
    setBusy(true);
    try {
      const result = await api("/cms-api/ai/newsletter", { topic: newsletterTopic });
      setNewsletter(result.draft); setSubscribers(result.activeSubscribers); setMessage("Newsletter copy is ready to review and copy.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Newsletter generation failed."); }
    finally { setBusy(false); }
  }

  const tabs = [["wallpaper", "AI Wallpaper"], ["blog", "AI Blog Post"], ["newsletter", "AI Newsletter"]] as const;
  return <main style={{ minHeight: "100vh", padding: "42px 20px 90px", background: "#050b10", color: "#f6fbff" }}>
    <section style={{ width: "min(1080px, 100%)", margin: "0 auto" }}>
      <p className="eyebrow">Google AI content engine</p>
      <h1 style={{ marginTop: 12, fontSize: "clamp(36px, 6vw, 68px)", letterSpacing: "-.05em" }}>AI Studio</h1>
      <p style={{ maxWidth: 760, color: "#9fb0bb", lineHeight: 1.7 }}>One private Google AI Studio key powers wallpaper generation, visual SEO analysis, complete blog drafts and newsletter copy.</p>
      <div style={{ marginTop: 20, border: `1px solid ${configured ? "#2f6149" : "#654f25"}`, background: configured ? "#0a1a15" : "#18150c", padding: 15, borderRadius: 14, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}><span>{message}</span><Link href="/studio/globals/ai-settings" style={{ color: "#e6ff45", fontWeight: 900 }}>Google AI key settings</Link></div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 26 }}>{tabs.map(([value, label]) => <button key={value} onClick={() => setTab(value)} style={{ border: "1px solid #2a3b46", borderRadius: 999, padding: "11px 16px", background: tab === value ? "#e6ff45" : "#0c171e", color: tab === value ? "#071017" : "#dce9ef", fontWeight: 900, cursor: "pointer" }}>{label}</button>)}</div>

      {tab === "wallpaper" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 22, marginTop: 24 }}>
        <div style={{ border: "1px solid #20313b", borderRadius: 20, background: "#09131a", padding: 20 }}>
          <h2>Generate and publish</h2><p style={{ color: "#8da0ac", lineHeight: 1.6 }}>Google creates the artwork, analyzes it, then prepares title, description, alt text, tags, Pinterest copy and SEO.</p>
          <label style={{ display: "block", marginTop: 18, color: "#a9bbc4", fontWeight: 800 }}>Wallpaper prompt<textarea value={wallpaperPrompt} onChange={(event) => setWallpaperPrompt(event.target.value)} rows={7} style={{ ...inputStyle, marginTop: 8, resize: "vertical" }} /></label>
          <label style={{ display: "block", marginTop: 14, color: "#a9bbc4", fontWeight: 800 }}>Aspect ratio<select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} style={{ ...inputStyle, marginTop: 8 }}><option value="9:16">Phone · 9:16</option><option value="16:9">Desktop · 16:9</option><option value="1:1">Square · 1:1</option><option value="3:4">Portrait · 3:4</option><option value="4:3">Landscape · 4:3</option></select></label>
          <button onClick={generateWallpaper} disabled={!configured || busy} style={{ ...buttonStyle, marginTop: 18, opacity: !configured || busy ? .55 : 1 }}>{busy ? "AI is working…" : "Generate wallpaper + SEO"}</button>
        </div>
        <div style={{ border: "1px solid #20313b", borderRadius: 20, background: "#09131a", padding: 20 }}>
          {wallpaper ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:${wallpaper.image.mimeType};base64,${wallpaper.image.base64}`} alt={wallpaper.seo.alt} style={{ width: "100%", maxHeight: 560, objectFit: "contain", borderRadius: 14, background: "#020609" }} /><h3 style={{ marginTop: 16 }}>{wallpaper.seo.title}</h3><p style={{ color: "#9fb0bb", lineHeight: 1.6 }}>{wallpaper.seo.description}</p>
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}><select value={categoryId ?? ""} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} style={inputStyle}><option value="">Select category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label style={{ display: "flex", gap: 9, alignItems: "center" }}><input type="checkbox" checked={useCollections} onChange={(event) => setUseCollections(event.target.checked)} />Add to collection(s) — optional</label>{useCollections && <select multiple value={collectionIds.map(String)} onChange={(event) => setCollectionIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))} style={{ ...inputStyle, minHeight: 90 }}>{collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}</div>
            <button onClick={publishWallpaper} disabled={busy || !categoryId} style={{ ...buttonStyle, marginTop: 18 }}>{busy ? "Publishing…" : "Publish verified wallpaper"}</button>{publishedUrl && <a href={publishedUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 14, color: "#75ddff", fontWeight: 900 }}>View live ↗</a>}</> : <div style={{ minHeight: 420, display: "grid", placeItems: "center", color: "#748893", textAlign: "center" }}>Your generated wallpaper and editable SEO preview will appear here.</div>}
        </div>
      </div>}

      {tab === "blog" && <div style={{ marginTop: 24, border: "1px solid #20313b", borderRadius: 20, background: "#09131a", padding: 22 }}><h2>AI blog post + cover</h2><p style={{ color: "#8da0ac" }}>Creates useful article copy, SEO, Pinterest fields and an original cover, then saves everything as a draft for your approval.</p><textarea value={blogTopic} onChange={(event) => setBlogTopic(event.target.value)} rows={4} style={{ ...inputStyle, marginTop: 14 }} /><button onClick={generateBlog} disabled={!configured || busy} style={{ ...buttonStyle, marginTop: 16 }}>{busy ? "Creating article and cover…" : "Generate and save draft"}</button>{blog && <article style={{ marginTop: 24, borderTop: "1px solid #20313b", paddingTop: 20 }}><h2>{blog.title}</h2><p style={{ color: "#9fb0bb" }}>{blog.excerpt}</p>{blog.sections.map((section) => <div key={section.heading}><h3 style={{ marginTop: 20 }}>{section.heading}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph} style={{ color: "#b7c5cc", lineHeight: 1.7 }}>{paragraph}</p>)}</div>)}{blogEditUrl && <a href={blogEditUrl} style={{ display: "inline-block", marginTop: 18, color: "#e6ff45", fontWeight: 900 }}>Review draft in Admin Panel →</a>}</article>}</div>}

      {tab === "newsletter" && <div style={{ marginTop: 24, border: "1px solid #20313b", borderRadius: 20, background: "#09131a", padding: 22 }}><h2>AI newsletter writer</h2><p style={{ color: "#8da0ac" }}>Creates a subject, preview line, polished body and CTA for your active subscriber audience.</p><textarea value={newsletterTopic} onChange={(event) => setNewsletterTopic(event.target.value)} rows={4} style={{ ...inputStyle, marginTop: 14 }} /><button onClick={generateNewsletter} disabled={!configured || busy} style={{ ...buttonStyle, marginTop: 16 }}>{busy ? "Writing newsletter…" : "Generate newsletter"}</button>{newsletter && <article style={{ marginTop: 24, borderTop: "1px solid #20313b", paddingTop: 20 }}><p style={{ color: "#75ddff", fontWeight: 900 }}>Audience: {subscribers ?? 0} active subscribers</p><h3>Subject: {newsletter.subject}</h3><p style={{ color: "#879aa5" }}>{newsletter.previewText}</p><h2>{newsletter.heading}</h2>{newsletter.paragraphs.map((paragraph) => <p key={paragraph} style={{ color: "#b7c5cc", lineHeight: 1.7 }}>{paragraph}</p>)}<a href={newsletter.ctaUrl} style={{ color: "#e6ff45", fontWeight: 900 }}>{newsletter.ctaLabel}</a><br /><button onClick={() => navigator.clipboard.writeText(newsletter.plainText)} style={{ ...buttonStyle, marginTop: 20, background: "#75ddff" }}>Copy newsletter text</button></article>}</div>}
    </section>
  </main>;
}
