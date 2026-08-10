import type { Endpoint } from "payload";
import {
  analyzeWallpaper,
  generateBlogDraft,
  generateNewsletterDraft,
  generateWallpaperImage,
  getAIStatus,
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
  aiStatusEndpoint,
  aiAnalyzeImageEndpoint,
  aiGenerateWallpaperEndpoint,
  aiBlogEndpoint,
  aiNewsletterEndpoint,
];
