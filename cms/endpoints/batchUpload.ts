import type { Endpoint } from "payload";

type PayloadId = number;

type BatchUploadBody = {
  filename?: string;
  mimeType?: string;
  base64?: string;
  title?: string;
  slug?: string;
  description?: string;
  alt?: string;
  tags?: string[];
  palette?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  pinterestTitle?: string;
  pinterestDescription?: string;
  width?: number;
  height?: number;
  categoryId?: number;
  collectionIds?: number[];
};

type RelationOption = { id: PayloadId; name: string; slug: string };

function canUpload(user: unknown) {
  if (!user || typeof user !== "object") return false;
  const candidate = user as { collection?: string; role?: string };
  return candidate.collection === "users" && ["admin", "editor"].includes(candidate.role ?? "");
}

function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function decodeBase64(value: string) {
  const raw = value.includes(",") ? value.slice(value.indexOf(",") + 1) : value;
  return Buffer.from(raw, "base64");
}

async function findBySlug(req: Parameters<Endpoint["handler"]>[0], collection: string, slug: string) {
  const result = await req.payload.find({
    collection: collection as never,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });
  return result.docs[0] as { id: PayloadId; title?: string } | undefined;
}

async function getNatureCategory(req: Parameters<Endpoint["handler"]>[0], cover: PayloadId) {
  const existing = await findBySlug(req, "categories", "nature");
  if (existing) return existing.id;

  const created = await req.payload.create({
    collection: "categories",
    data: {
      name: "Nature",
      slug: "nature",
      description: "Peaceful landscapes, forests, waterfalls, mountains and scenic nature wallpapers.",
      cover,
      featured: true,
      seo: {
        metaTitle: "Nature Wallpapers for Phone and Desktop",
        metaDescription: "Explore scenic nature wallpapers featuring forests, lakes, mountains and waterfalls.",
        focusKeyword: "nature wallpapers",
      },
      _status: "published",
    },
    overrideAccess: true,
  });
  return created.id;
}

async function getRelationOptions(req: Parameters<Endpoint["handler"]>[0], collection: "categories" | "collections") {
  const result = await req.payload.find({
    collection,
    limit: 100,
    sort: "name",
    overrideAccess: true,
  });
  return result.docs.map((document) => ({
    id: document.id as PayloadId,
    name: document.name,
    slug: document.slug,
  })) as RelationOption[];
}

export const batchUploadOptionsEndpoint: Endpoint = {
  path: "/batch-upload",
  method: "get",
  handler: async (req) => {
    if (!canUpload(req.user)) {
      return Response.json({ error: "Administrator or Editor login required." }, { status: 403 });
    }
    const [categories, collections] = await Promise.all([
      getRelationOptions(req, "categories"),
      getRelationOptions(req, "collections"),
    ]);
    return Response.json({ categories, collections });
  },
};

export const batchUploadEndpoint: Endpoint = {
  path: "/batch-upload",
  method: "post",
  handler: async (req) => {
    if (!canUpload(req.user)) {
      return Response.json({ error: "Administrator or Editor login required." }, { status: 403 });
    }

    const body = (await req.json?.().catch(() => null)) as BatchUploadBody | null;
    if (!body) return Response.json({ error: "Invalid upload request." }, { status: 400 });

    const title = text(body.title, 120);
    const slug = cleanSlug(text(body.slug || title, 140));
    const description = text(body.description, 600);
    const alt = text(body.alt || title, 180);
    const mimeType = text(body.mimeType, 80) || "image/webp";
    const originalName = text(body.filename, 180) || `${slug || "wallpaper"}.webp`;

    if (!title || !slug || !description || !body.base64) {
      return Response.json({ error: "Title, slug, description and image are required." }, { status: 400 });
    }
    if (!mimeType.startsWith("image/")) {
      return Response.json({ error: "Only image files are accepted." }, { status: 415 });
    }

    const existing = await findBySlug(req, "wallpapers", slug);
    if (existing) {
      return Response.json({ ok: true, skipped: true, slug, title: existing.title ?? title });
    }

    const bytes = decodeBase64(body.base64);
    if (!bytes.length || bytes.length > 4_000_000) {
      return Response.json({ error: "Optimized image must be smaller than 4 MB." }, { status: 413 });
    }

    const uploadName = `${slug}.${mimeType.includes("png") ? "png" : mimeType.includes("jpeg") ? "jpg" : "webp"}`;
    const media = await req.payload.create({
      collection: "media",
      data: {
        alt,
        kind: "wallpaper",
        caption: description,
        copyrightSafe: true,
        sourceNote: `Original artwork batch uploaded as ${originalName}.`,
      },
      file: { data: bytes, mimetype: mimeType, name: uploadName, size: bytes.length },
      overrideAccess: true,
    });

    const categories = await getRelationOptions(req, "categories");
    const collections = await getRelationOptions(req, "collections");
    const requestedCategory = categories.find((item) => item.id === Number(body.categoryId));
    const requestedCollections = Array.isArray(body.collectionIds)
      ? collections.filter((item) => body.collectionIds?.map(Number).includes(item.id))
      : [];
    const category = requestedCategory?.id ?? await getNatureCategory(req, media.id);
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => text(tag, 50)).filter(Boolean).slice(0, 12)
      : [];
    const width = Math.max(1, Number(body.width) || 941);
    const height = Math.max(1, Number(body.height) || 1672);

    const wallpaper = await req.payload.create({
      collection: "wallpapers",
      data: {
        title,
        slug,
        description,
        previewImage: media.id,
        downloads: {
          phone: media.id,
          tablet: media.id,
          laptop: media.id,
          desktop4K: media.id,
        },
        category,
        collections: requestedCollections.map((item) => item.id),
        tags: tags.map((tag) => ({ tag })),
        palette: text(body.palette, 100),
        resolutionLabel: height > width ? "Portrait HD" : "HD",
        dimensions: `${width} × ${height}`,
        featured: false,
        popularity: 0,
        license: "personal",
        pinterest: {
          title: text(body.pinterestTitle || title, 100),
          description: text(body.pinterestDescription || description, 500),
          board: "4K Nature Wallpapers",
          destinationUrl: `/wallpapers/${slug}`,
        },
        seo: {
          metaTitle: text(body.metaTitle || title, 60),
          metaDescription: text(body.metaDescription || description, 160),
          focusKeyword: text(body.focusKeyword || tags[0] || "nature wallpaper", 80),
          ogImage: media.id,
          noIndex: false,
        },
        _status: "published",
      },
      overrideAccess: true,
    });

    await Promise.all(requestedCollections.map(async (collection) => {
      const existingCollection = await req.payload.findByID({
        collection: "collections",
        id: collection.id,
        depth: 0,
        overrideAccess: true,
      });
      const wallpaperIds = (existingCollection.wallpapers ?? []).map((item) =>
        typeof item === "object" ? item.id : item,
      );
      if (!wallpaperIds.includes(wallpaper.id)) {
        await req.payload.update({
          collection: "collections",
          id: collection.id,
          data: { wallpapers: [...wallpaperIds, wallpaper.id] },
          overrideAccess: true,
        });
      }
    }));

    return Response.json({ ok: true, skipped: false, id: wallpaper.id, slug, title });
  },
};
