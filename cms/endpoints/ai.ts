import type { Endpoint } from "payload";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  analyzeWallpaper,
  generateBlogDraft,
  generateNewsletterDraft,
  generatePersonalizedNameArtwork,
  generateWallpaperImage,
  getAIStatus,
  getPublicAISettings,
} from "../ai/gemini";

type EndpointRequest = Parameters<Endpoint["handler"]>[0];

function canUseAI(user: unknown) {
  if (!user || typeof user !== "object") return false;
  const candidate = user as { collection?: string; role?: string };
  return candidate.collection === "users" && ["admin", "editor", "author"].includes(candidate.role ?? "");
}

function forbidden(req: EndpointRequest) {
  if (canUseAI(req.user)) return null;
  return Response.json({ error: "Administrator, Editor or Author login required." }, { status: 403 });
}

function cleanBase64(value: unknown) {
  if (typeof value !== "string") return "";
  return value.includes(",") ? value.slice(value.indexOf(",") + 1) : value;
}

function cleanText(value: unknown, max = 2_000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function errorResponse(error: unknown) {
  return Response.json({ error: error instanceof Error ? error.message : "AI request failed." }, { status: 500 });
}

const NAME_QUOTA_COOKIE = "ws_name_ai_quota";
const NAME_VIBE_COOKIE = "ws_name_ai_vibe";
const nameArtDirections = [
  { id: "obsidian-gold", label: "Obsidian Gold", description: "Sculpted darkness · molten gold", accent: "#f6c65b", textStart: "#fff4bd", textEnd: "#d79121", typography: "signature", prompt: "deep obsidian mineral layers, fine molten-gold veins, couture editorial lighting, quiet luxury" },
  { id: "aurora-glass", label: "Aurora Glass", description: "Luminous calm · arctic cyan", accent: "#66f3ff", textStart: "#f8feff", textEnd: "#72dbea", typography: "modern", prompt: "translucent arctic glass, flowing cyan aurora, midnight navy depth, pristine reflections" },
  { id: "royal-nebula", label: "Royal Nebula", description: "Cosmic depth · regal violet", accent: "#b28cff", textStart: "#ffffff", textEnd: "#bda8ff", typography: "bold", prompt: "velvety violet nebula, silver orbital dust, sculptural cosmic light, regal futuristic atmosphere" },
  { id: "emerald-sanctuary", label: "Emerald Sanctuary", description: "Living calm · deep emerald", accent: "#72e7b5", textStart: "#f4fff9", textEnd: "#86d9b4", typography: "modern", prompt: "abstract emerald sanctuary, botanical mist, dark glass foliage, soft bioluminescent light" },
  { id: "crimson-forge", label: "Crimson Forge", description: "Bold energy · ruby ember", accent: "#ff786f", textStart: "#fff4ee", textEnd: "#ef765d", typography: "bold", prompt: "black volcanic glass, controlled crimson embers, cinematic smoke ribbons, powerful luxury energy" },
  { id: "liquid-chrome", label: "Liquid Chrome", description: "Precise focus · silver light", accent: "#c7e8ef", textStart: "#ffffff", textEnd: "#adc5cc", typography: "modern", prompt: "liquid chrome architecture, graphite shadows, precise reflections, minimalist industrial sculpture" },
  { id: "rose-celestine", label: "Rose Celestine", description: "Soft prestige · blush crystal", accent: "#ffb5d2", textStart: "#fff8fb", textEnd: "#efa7c3", typography: "signature", prompt: "smoky rose crystal caverns, pearl highlights, blush light through dark glass, refined fashion mood" },
  { id: "sapphire-tide", label: "Sapphire Tide", description: "Deep motion · ocean blue", accent: "#6eb8ff", textStart: "#f3f9ff", textEnd: "#73b6f2", typography: "bold", prompt: "translucent sapphire waves, midnight ocean depth, elegant caustic light, cinematic underwater calm" },
] as const;

function cleanName(value: unknown) {
  if (typeof value !== "string") return "";
  const name = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  return name.length <= 20 && /^[\p{L}\p{M}\p{N} .'-]+$/u.test(name) ? name : "";
}

function cookieValue(req: EndpointRequest, name: string) {
  const header = req.headers.get("cookie") ?? "";
  for (const item of header.split(";")) {
    const [key, ...parts] = item.trim().split("=");
    if (key === name) return decodeURIComponent(parts.join("="));
  }
  return "";
}

function quotaSecret() {
  return process.env.PAYLOAD_SECRET ?? "";
}

function signQuota(value: string) {
  return createHmac("sha256", quotaSecret()).update(value).digest("base64url");
}

function todayInRiyadh() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
}

function readQuota(req: EndpointRequest) {
  const raw = cookieValue(req, NAME_QUOTA_COOKIE);
  const [date, usedValue, signature] = raw.split(".");
  const signed = `${date}.${usedValue}`;
  const expected = signQuota(signed);
  const valid = Boolean(signature) && expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  return valid && date === todayInRiyadh() ? Math.max(0, Number.parseInt(usedValue, 10) || 0) : 0;
}

function quotaCookie(used: number) {
  const value = `${todayInRiyadh()}.${used}`;
  return `${NAME_QUOTA_COOKIE}=${encodeURIComponent(`${value}.${signQuota(value)}`)}; Path=/; Max-Age=172800; HttpOnly; Secure; SameSite=Lax`;
}

function chooseNameVibe(req: EndpointRequest, name: string) {
  const previous = Number.parseInt(cookieValue(req, NAME_VIBE_COOKIE), 10);
  const entropy = randomBytes(4).readUInt32BE(0);
  let index = entropy % nameArtDirections.length;
  if (Number.isFinite(previous) && index === previous) index = (index + 1 + (name.codePointAt(0) ?? 0)) % nameArtDirections.length;
  return { index, vibe: nameArtDirections[index] };
}

function vibeCookie(index: number) {
  return `${NAME_VIBE_COOKIE}=${index}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;
}

export const publicNameWallpaperStatusEndpoint: Endpoint = {
  path: "/ai/name-wallpaper",
  method: "get",
  handler: async (req) => {
    try {
      const settings = await getPublicAISettings(req.payload);
      const used = readQuota(req);
      return Response.json({ provider: "gemini", configured: settings.configured && settings.enabled, limit: settings.dailyLimit, remaining: Math.max(0, settings.dailyLimit - used) });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

export const publicNameWallpaperGenerateEndpoint: Endpoint = {
  path: "/ai/name-wallpaper",
  method: "post",
  handler: async (req) => {
    try {
      const body = await req.json?.() as { name?: unknown };
      const name = cleanName(body?.name);
      if (!name) return Response.json({ error: "Enter 1–20 valid letters or numbers." }, { status: 400 });
      const settings = await getPublicAISettings(req.payload);
      if (!settings.configured || !settings.enabled) return Response.json({ error: "AI generation is waiting for secure Admin setup." }, { status: 503 });
      const used = readQuota(req);
      if (used >= settings.dailyLimit) return Response.json({ error: `You have used all ${settings.dailyLimit} free AI wallpapers for today.`, remaining: 0, limit: settings.dailyLimit }, { status: 429 });
      const { index, vibe } = chooseNameVibe(req, name);
      const image = await generatePersonalizedNameArtwork(req.payload, { name, artDirection: vibe.prompt, variationSeed: randomBytes(12).toString("hex") });
      const headers = new Headers({ "Cache-Control": "no-store" });
      headers.append("Set-Cookie", quotaCookie(used + 1));
      headers.append("Set-Cookie", vibeCookie(index));
      return Response.json({ ok: true, provider: "gemini", image: `data:${image.mimeType};base64,${image.base64}`, theme: { id: vibe.id, label: vibe.label, description: vibe.description, accent: vibe.accent, textStart: vibe.textStart, textEnd: vibe.textEnd, typography: vibe.typography }, limit: settings.dailyLimit, remaining: Math.max(0, settings.dailyLimit - used - 1) }, { headers });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

function lexicalBody(sections: Array<{ heading: string; paragraphs: string[] }>) {
  const children = sections.flatMap((section) => [
    {
      type: "heading", tag: "h2", version: 1, direction: "ltr", format: "", indent: 0,
      children: [{ type: "text", version: 1, text: section.heading, detail: 0, format: 0, mode: "normal", style: "" }],
    },
    ...section.paragraphs.map((paragraph) => ({
      type: "paragraph", version: 1, direction: "ltr", format: "", indent: 0, textFormat: 0, textStyle: "",
      children: [{ type: "text", version: 1, text: paragraph, detail: 0, format: 0, mode: "normal", style: "" }],
    })),
  ]);
  return { root: { type: "root", version: 1, direction: "ltr" as const, format: "" as const, indent: 0, children } };
}

async function uniqueBlogSlug(req: EndpointRequest, requested: string) {
  const base = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120) || "ai-wallpaper-guide";
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`;
    const result = await req.payload.find({ collection: "blog-posts", where: { slug: { equals: slug } }, limit: 1, overrideAccess: true });
    if (!result.docs.length) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export const aiStatusEndpoint: Endpoint = {
  path: "/ai/status",
  method: "get",
  handler: async (req) => {
    const denied = forbidden(req);
    if (denied) return denied;
    try {
      return Response.json(await getAIStatus(req.payload));
    } catch (error) {
      return errorResponse(error);
    }
  },
};

export const aiAnalyzeImageEndpoint: Endpoint = {
  path: "/ai/analyze-image",
  method: "post",
  handler: async (req) => {
    const denied = forbidden(req);
    if (denied) return denied;
    try {
      const body = await req.json?.() as { base64?: string; mimeType?: string };
      const base64 = cleanBase64(body?.base64);
      const mimeType = cleanText(body?.mimeType, 80) || "image/webp";
      if (!base64 || base64.length > 12_000_000 || !mimeType.startsWith("image/")) {
        return Response.json({ error: "A valid optimized image is required." }, { status: 400 });
      }
      const seo = await analyzeWallpaper(req.payload, { base64, mimeType });
      return Response.json({ ok: true, seo });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

export const aiGenerateWallpaperEndpoint: Endpoint = {
  path: "/ai/generate-wallpaper",
  method: "post",
  handler: async (req) => {
    const denied = forbidden(req);
    if (denied) return denied;
    try {
      const body = await req.json?.() as { prompt?: string; aspectRatio?: string };
      const prompt = cleanText(body?.prompt, 1_500);
      const aspectRatio = ["9:16", "16:9", "1:1", "3:4", "4:3"].includes(body?.aspectRatio ?? "") ? body.aspectRatio! : "9:16";
      if (prompt.length < 12) return Response.json({ error: "Describe the wallpaper in a little more detail." }, { status: 400 });
      const image = await generateWallpaperImage(req.payload, prompt, aspectRatio);
      const seo = await analyzeWallpaper(req.payload, image);
      return Response.json({ ok: true, image, seo });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

export const aiBlogEndpoint: Endpoint = {
  path: "/ai/blog",
  method: "post",
  handler: async (req) => {
    const denied = forbidden(req);
    if (denied) return denied;
    try {
      const body = await req.json?.() as { topic?: string; saveDraft?: boolean; generateCover?: boolean };
      const topic = cleanText(body?.topic, 1_000);
      if (topic.length < 8) return Response.json({ error: "Enter a clear blog topic." }, { status: 400 });
      const draft = await generateBlogDraft(req.payload, topic);
      if (!body.saveDraft) return Response.json({ ok: true, draft, saved: false });

      if (!body.generateCover) {
        return Response.json({ ok: true, draft, saved: false, warning: "Enable AI cover generation to save a complete CMS draft." });
      }

      const cover = await generateWallpaperImage(req.payload, `Editorial blog cover for: ${draft.title}. Premium photographic or digital-art composition with generous negative space, no text.`, "16:9");
      const coverBytes = Buffer.from(cover.base64, "base64");
      const slug = await uniqueBlogSlug(req, draft.slug || draft.title);
      const media = await req.payload.create({
        collection: "media",
        data: { alt: `${draft.title} editorial cover`, kind: "blog", caption: draft.excerpt, copyrightSafe: true, sourceNote: "Original cover generated with Google Gemini and marked with SynthID by the provider." },
        file: { data: coverBytes, mimetype: cover.mimeType, name: `${slug}-cover.${cover.mimeType.includes("jpeg") ? "jpg" : "png"}`, size: coverBytes.length },
        overrideAccess: true,
      });
      const user = req.user as { id?: number };
      const post = await req.payload.create({
        collection: "blog-posts",
        data: {
          title: draft.title, slug, excerpt: draft.excerpt, cover: media.id, category: draft.category,
          body: lexicalBody(draft.sections), author: user.id, readTime: Math.max(3, Math.ceil(draft.sections.reduce((count, section) => count + section.paragraphs.join(" ").split(/\s+/).length, 0) / 220)),
          pinterest: { title: draft.pinterestTitle.slice(0, 100), description: draft.pinterestDescription.slice(0, 500), board: "Wallpaper Ideas", destinationUrl: `/blog/${slug}` },
          seo: { metaTitle: draft.metaTitle.slice(0, 60), metaDescription: draft.metaDescription.slice(0, 160), focusKeyword: draft.focusKeyword, ogImage: media.id, noIndex: false },
          _status: "draft",
        },
        draft: true,
        overrideAccess: true,
      });
      return Response.json({ ok: true, draft: { ...draft, slug }, saved: true, id: post.id, editUrl: `/studio/collections/blog-posts/${post.id}` });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

export const aiNewsletterEndpoint: Endpoint = {
  path: "/ai/newsletter",
  method: "post",
  handler: async (req) => {
    const denied = forbidden(req);
    if (denied) return denied;
    try {
      const body = await req.json?.() as { topic?: string };
      const topic = cleanText(body?.topic, 1_000);
      if (topic.length < 8) return Response.json({ error: "Enter a clear newsletter topic." }, { status: 400 });
      const websiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "/explore";
      const [draft, subscribers] = await Promise.all([
        generateNewsletterDraft(req.payload, topic, websiteUrl),
        req.payload.count({ collection: "newsletter-subscribers", where: { status: { equals: "active" } }, overrideAccess: true }),
      ]);
      return Response.json({ ok: true, draft, activeSubscribers: subscribers.totalDocs });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

export const aiEndpoints = [
  publicNameWallpaperStatusEndpoint,
  publicNameWallpaperGenerateEndpoint,
  aiStatusEndpoint,
  aiAnalyzeImageEndpoint,
  aiGenerateWallpaperEndpoint,
  aiBlogEndpoint,
  aiNewsletterEndpoint,
];
