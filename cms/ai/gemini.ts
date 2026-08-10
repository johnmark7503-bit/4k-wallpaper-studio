import type { Payload } from "payload";
import { decryptAPIKey, isEncryptedAPIKey } from "./credentials";

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? "gemini-3.6-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";

type GeminiPart = {
  text?: string;
  inlineData?: { data?: string; mimeType?: string };
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string; status?: string };
};

type AISettingsDocument = {
  enabled?: boolean | null;
  model?: string | null;
  imageSize?: "1K" | "2K" | "4K" | null;
  dailyLimit?: number | null;
};

export type WallpaperSEO = {
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
  suggestedCategory: string;
};

export type BlogDraft = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  pinterestTitle: string;
  pinterestDescription: string;
};

export type NewsletterDraft = {
  subject: string;
  previewText: string;
  heading: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  plainText: string;
};

const wallpaperSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" },
    alt: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    palette: { type: "string" },
    focusKeyword: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    pinterestTitle: { type: "string" },
    pinterestDescription: { type: "string" },
    suggestedCategory: { type: "string" },
  },
  required: ["title", "slug", "description", "alt", "tags", "palette", "focusKeyword", "metaTitle", "metaDescription", "pinterestTitle", "pinterestDescription", "suggestedCategory"],
};

const blogSchema = {
  type: "object",
  properties: {
    title: { type: "string" }, slug: { type: "string" }, excerpt: { type: "string" }, category: { type: "string" },
    sections: { type: "array", items: { type: "object", properties: { heading: { type: "string" }, paragraphs: { type: "array", items: { type: "string" } } }, required: ["heading", "paragraphs"] } },
    tags: { type: "array", items: { type: "string" } }, metaTitle: { type: "string" }, metaDescription: { type: "string" }, focusKeyword: { type: "string" }, pinterestTitle: { type: "string" }, pinterestDescription: { type: "string" },
  },
  required: ["title", "slug", "excerpt", "category", "sections", "tags", "metaTitle", "metaDescription", "focusKeyword", "pinterestTitle", "pinterestDescription"],
};

const newsletterSchema = {
  type: "object",
  properties: {
    subject: { type: "string" }, previewText: { type: "string" }, heading: { type: "string" }, paragraphs: { type: "array", items: { type: "string" } }, ctaLabel: { type: "string" }, ctaUrl: { type: "string" }, plainText: { type: "string" },
  },
  required: ["subject", "previewText", "heading", "paragraphs", "ctaLabel", "ctaUrl", "plainText"],
};

function cleanSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120);
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function getSettings(payload: Payload) {
  return payload.findGlobal({
    slug: "ai-settings",
    overrideAccess: true,
    context: { revealAISecret: true },
  }) as Promise<AISettingsDocument>;
}

export async function getAIStatus(payload: Payload) {
  const settings = await getSettings(payload);
  const stored = isEncryptedAPIKey(settings.model);
  const environment = Boolean(process.env.GEMINI_API_KEY);
  return {
    enabled: settings.enabled !== false && (stored || environment),
    configured: stored || environment,
    source: stored ? "admin" : environment ? "environment" : "none",
    imageSize: settings.imageSize ?? "2K",
  };
}

export async function getPublicAISettings(payload: Payload) {
  const settings = await getSettings(payload);
  const status = await getAIStatus(payload);
  return {
    ...status,
    dailyLimit: Math.max(1, Math.min(20, Number(settings.dailyLimit) || 3)),
  };
}

async function getAPIKey(payload: Payload) {
  const settings = await getSettings(payload);
  if (settings.enabled === false) throw new Error("AI is disabled in AI wallpaper settings.");
  if (isEncryptedAPIKey(settings.model)) return { key: decryptAPIKey(settings.model), imageSize: settings.imageSize ?? "2K" };
  if (process.env.GEMINI_API_KEY) return { key: process.env.GEMINI_API_KEY, imageSize: settings.imageSize ?? "2K" };
  throw new Error("Add your Google AI Studio API key in AI wallpaper settings first.");
}

async function requestGemini(payload: Payload, model: string, body: Record<string, unknown>) {
  const { key } = await getAPIKey(payload);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(110_000),
  });
  const result = await response.json() as GeminiResponse;
  if (!response.ok) throw new Error(result.error?.message ?? `Google AI request failed (${response.status}).`);
  return result;
}

function responseText(result: GeminiResponse) {
  return result.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text ?? "";
}

async function generateJSON<T>(payload: Payload, prompt: string, schema: Record<string, unknown>, image?: { base64: string; mimeType: string }) {
  const parts: GeminiPart[] = [];
  if (image) parts.push({ inlineData: { data: image.base64, mimeType: image.mimeType } });
  parts.push({ text: prompt });
  const result = await requestGemini(payload, TEXT_MODEL, {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  const raw = responseText(result);
  if (!raw) throw new Error("Google AI returned no structured content.");
  return JSON.parse(raw) as T;
}

export async function analyzeWallpaper(payload: Payload, image: { base64: string; mimeType: string }) {
  const result = await generateJSON<WallpaperSEO>(payload, `Analyze this wallpaper image visually. Create accurate, natural English SEO for a free 4K wallpaper website. Never guess a famous place or copyrighted character unless unmistakable. Title 45-70 characters, description 120-260 characters, alt text concise and literal, 6-10 search tags, meta title <=60 characters, meta description <=160 characters, Pinterest title <=100 characters and Pinterest description 180-350 characters. The slug must be lowercase ASCII words. Suggested category should be one simple label such as Nature, Abstract, Anime, Cars, Space, Dark, Minimal, Animals, Architecture or Fantasy.`, wallpaperSchema, image);
  const title = text(result.title, 120) || "Original 4K Wallpaper";
  return {
    ...result,
    title,
    slug: cleanSlug(result.slug || title),
    description: text(result.description, 600),
    alt: text(result.alt, 180),
    tags: Array.isArray(result.tags) ? result.tags.map((tag) => text(tag, 50)).filter(Boolean).slice(0, 12) : [],
    palette: text(result.palette, 100),
    focusKeyword: text(result.focusKeyword, 80),
    metaTitle: text(result.metaTitle || title, 60),
    metaDescription: text(result.metaDescription, 160),
    pinterestTitle: text(result.pinterestTitle || title, 100),
    pinterestDescription: text(result.pinterestDescription, 500),
    suggestedCategory: text(result.suggestedCategory, 80),
  } satisfies WallpaperSEO;
}

export async function generateWallpaperImage(payload: Payload, prompt: string, aspectRatio = "9:16") {
  const settings = await getAPIKey(payload);
  const result = await requestGemini(payload, IMAGE_MODEL, {
    contents: [{ role: "user", parts: [{ text: `${prompt.trim()}\nCreate an original premium wallpaper. No text, no logo, no watermark-like typography, no copyrighted characters. Clean wallpaper composition.` }] }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio, imageSize: settings.imageSize } },
  });
  const imagePart = result.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) throw new Error("Google AI did not return an image. Try a clearer prompt.");
  return { base64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType ?? "image/png" };
}

export async function generatePersonalizedNameArtwork(
  payload: Payload,
  input: { name: string; artDirection: string; variationSeed: string },
) {
  const settings = await getAPIKey(payload);
  const systemInstruction = [
    "You are the lead artist for a premium personalized wallpaper studio.",
    "Create a genuinely original visual world for each request; never reuse a fixed template or merely swap colors.",
    "Treat the supplied name as creative inspiration for mood, rhythm, lighting, materials and composition.",
    "The artwork must remain elegant, cinematic, mobile-first and commercially safe.",
    "Do not draw any text, letters, initials, logos, signatures, watermarks, people, faces, brands or copyrighted characters.",
    "Leave calm, high-contrast negative space around the center because the studio adds the exact name afterward.",
  ].join(" ");
  const prompt = [
    `Personalization name: ${JSON.stringify(input.name)}.`,
    `Premium art direction: ${input.artDirection}.`,
    `Unique variation seed: ${input.variationSeed}.`,
    "Create one polished vertical 9:16 wallpaper background with layered depth, refined detail and a distinct visual identity.",
    "Keep key visual interest around the outer thirds and preserve a clean central title-safe area.",
  ].join(" ");
  const result = await requestGemini(payload, IMAGE_MODEL, {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "9:16", imageSize: settings.imageSize },
    },
  });
  const imagePart = result.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) throw new Error("Google AI did not return a name wallpaper. Please try again.");
  return { base64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType ?? "image/png" };
}

export async function generateBlogDraft(payload: Payload, topic: string) {
  return generateJSON<BlogDraft>(payload, `Write a complete, genuinely useful SEO blog post for a premium 4K wallpaper website about: ${topic}. Use clear international English, 4-6 logical sections, 2-3 concise paragraphs per section, no fabricated statistics, no keyword stuffing, and a helpful expert tone. Also create Pinterest copy.`, blogSchema);
}

export async function generateNewsletterDraft(payload: Payload, topic: string, websiteUrl: string) {
  return generateJSON<NewsletterDraft>(payload, `Write a concise, polished newsletter for subscribers of 4K Wallpaper Studio. Topic: ${topic}. The CTA should point to ${websiteUrl || "/explore"}. Use warm editorial English, a strong but non-spammy subject, helpful preview text, 3-5 short paragraphs, and one CTA.`, newsletterSchema);
}
