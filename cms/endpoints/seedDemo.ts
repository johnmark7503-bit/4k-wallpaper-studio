import type { Endpoint } from "payload";
import { blogPosts, categories, collections, wallpapers } from "../../app/(frontend)/_data/site-data";

type SeedRequest = { stage?: "media" | "content"; offset?: number; limit?: number };
type PayloadId = number;

const assetPaths = wallpapers.flatMap((wallpaper) => {
  const preview = wallpaper.src;
  const base = preview.split("/").pop()?.replace(/\.webp$/, "") ?? wallpaper.slug;
  return [
    preview,
    `/downloads/${base}-phone.webp`,
    `/downloads/${base}-tablet.webp`,
    `/downloads/${base}-laptop.webp`,
    `/downloads/${base}-4k.webp`,
  ];
});

function isAdmin(user: unknown) {
  return Boolean(user && typeof user === "object" && (user as { role?: string }).role === "admin");
}

function filename(assetPath: string) {
  return assetPath.split("/").pop() ?? "wallpaper.webp";
}

function requiredId(value: PayloadId | undefined, label: string): PayloadId {
  if (value === undefined) throw new Error(`Missing imported record: ${label}`);
  return value;
}

function absoluteAssetUrl(req: Parameters<Endpoint["handler"]>[0], assetPath: string) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") ?? "https";
  if (!host) throw new Error("Unable to determine the website host.");
  return `${protocol}://${host}${assetPath}`;
}

async function findBySlug(req: Parameters<Endpoint["handler"]>[0], collection: string, slug: string) {
  const result = await req.payload.find({
    collection: collection as never,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });
  return result.docs[0] as { id: PayloadId } | undefined;
}

async function mediaId(req: Parameters<Endpoint["handler"]>[0], assetPath: string) {
  const name = filename(assetPath);
  const result = await req.payload.find({
    collection: "media",
    where: { filename: { equals: name } },
    limit: 1,
    overrideAccess: true,
  });
  const existing = result.docs[0];
  if (existing) return existing.id;

  const response = await fetch(absoluteAssetUrl(req, assetPath));
  if (!response.ok) throw new Error(`Could not load ${assetPath}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const created = await req.payload.create({
    collection: "media",
    data: {
      alt: name.replace(/[-_]/g, " ").replace(/\.webp$/i, ""),
      kind: assetPath.startsWith("/downloads/") ? "download" : "wallpaper",
      copyrightSafe: true,
      sourceNote: "Original launch artwork imported from the website bundle.",
    },
    file: { data: bytes, mimetype: response.headers.get("content-type") ?? "image/webp", name, size: bytes.length },
    overrideAccess: true,
  });
  return created.id;
}

function lexicalBody(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        textFormat: 0,
        textStyle: "",
        children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 }],
      })),
    },
  };
}

export const seedDemoEndpoint: Endpoint = {
  path: "/seed-demo",
  method: "post",
  handler: async (req) => {
    if (!isAdmin(req.user)) return Response.json({ error: "Administrator login required." }, { status: 403 });

    const body = (await req.json?.().catch(() => ({}))) as SeedRequest;
    if (body.stage === "media") {
      const offset = Math.max(0, Number(body.offset) || 0);
      const limit = Math.min(5, Math.max(1, Number(body.limit) || 3));
      const batch = assetPaths.slice(offset, offset + limit);
      for (const assetPath of batch) await mediaId(req, assetPath);
      const nextOffset = offset + batch.length;
      return Response.json({ stage: "media", processed: batch.length, nextOffset, total: assetPaths.length, done: nextOffset >= assetPaths.length });
    }

    if (body.stage !== "content") return Response.json({ error: "Invalid seed stage." }, { status: 400 });

    const media = new Map<string, PayloadId>();
    for (const assetPath of assetPaths) media.set(assetPath, await mediaId(req, assetPath));

    const categoryIds = new Map<string, PayloadId>();
    for (const category of categories) {
      const existing = await findBySlug(req, "categories", category.slug);
      const id = existing?.id ?? (await req.payload.create({
        collection: "categories",
        data: { ...category, cover: requiredId(media.get(category.cover), category.cover), featured: true, _status: "published" },
        overrideAccess: true,
      })).id;
      categoryIds.set(category.slug, id);
    }

    const collectionIds = new Map<string, PayloadId>();
    for (const collection of collections) {
      const existing = await findBySlug(req, "collections", collection.slug);
      const id = existing?.id ?? (await req.payload.create({
        collection: "collections",
        data: { name: collection.name, slug: collection.slug, description: collection.description, cover: requiredId(media.get(collection.cover), collection.cover), featured: true, wallpapers: [], _status: "published" },
        overrideAccess: true,
      })).id;
      collectionIds.set(collection.slug, id);
    }

    const wallpaperIds = new Map<string, PayloadId>();
    for (const wallpaper of wallpapers) {
      const existing = await findBySlug(req, "wallpapers", wallpaper.slug);
      const base = wallpaper.src.split("/").pop()?.replace(/\.webp$/, "") ?? wallpaper.slug;
      const id = existing?.id ?? (await req.payload.create({
        collection: "wallpapers",
        data: {
          title: wallpaper.title,
          slug: wallpaper.slug,
          description: wallpaper.description,
          previewImage: requiredId(media.get(wallpaper.src), wallpaper.src),
          downloads: {
            phone: requiredId(media.get(`/downloads/${base}-phone.webp`), `${base} phone`),
            tablet: requiredId(media.get(`/downloads/${base}-tablet.webp`), `${base} tablet`),
            laptop: requiredId(media.get(`/downloads/${base}-laptop.webp`), `${base} laptop`),
            desktop4K: requiredId(media.get(`/downloads/${base}-4k.webp`), `${base} 4K`),
          },
          category: requiredId(categoryIds.get(wallpaper.categorySlug), wallpaper.categorySlug),
          collections: wallpaper.collectionSlugs.flatMap((slug) => {
            const id = collectionIds.get(slug);
            return id === undefined ? [] : [id];
          }),
          tags: wallpaper.tags.map((tag) => ({ tag })),
          palette: wallpaper.palette,
          resolutionLabel: wallpaper.resolution,
          dimensions: wallpaper.dimensions,
          featured: wallpaper.featured,
          popularity: wallpaper.popularity,
          license: "personal",
          _status: "published",
        },
        overrideAccess: true,
      })).id;
      wallpaperIds.set(wallpaper.slug, id);
    }

    for (const collection of collections) {
      await req.payload.update({
        collection: "collections",
        id: requiredId(collectionIds.get(collection.slug), collection.slug),
        data: { wallpapers: collection.wallpaperSlugs.map((slug) => requiredId(wallpaperIds.get(slug), slug)) },
        overrideAccess: true,
      });
    }

    for (const post of blogPosts) {
      if (await findBySlug(req, "blog-posts", post.slug)) continue;
      const paragraphs = post.sections.flatMap((section) => section.paragraphs);
      await req.payload.create({
        collection: "blog-posts",
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          cover: requiredId(media.get(post.cover), post.cover),
          category: post.category,
          body: lexicalBody(paragraphs),
          publishedAt: new Date(post.published).toISOString(),
          readTime: Number.parseInt(post.readTime, 10) || 5,
          _status: "published",
        },
        overrideAccess: true,
      });
    }

    return Response.json({ ok: true, media: media.size, categories: categoryIds.size, collections: collectionIds.size, wallpapers: wallpaperIds.size, blogPosts: blogPosts.length });
  },
};
