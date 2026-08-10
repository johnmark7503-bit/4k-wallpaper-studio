const VERCEL_BLOB_SUFFIX = ".public.blob.vercel-storage.com";

function isAllowedSource(source: URL, requestUrl: URL) {
  return (
    source.origin === requestUrl.origin ||
    source.hostname.endsWith(VERCEL_BLOB_SUFFIX)
  );
}

function safeFilename(value: string | null) {
  const fallback = "4k-wallpaper.webp";
  if (!value) return fallback;

  const cleaned = value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);

  return cleaned || fallback;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const sourceValue = requestUrl.searchParams.get("source");

  if (!sourceValue) {
    return Response.json({ error: "Wallpaper source is required." }, { status: 400 });
  }

  let source: URL;
  try {
    source = new URL(sourceValue, requestUrl.origin);
  } catch {
    return Response.json({ error: "Wallpaper source is invalid." }, { status: 400 });
  }

  if (!isAllowedSource(source, requestUrl)) {
    return Response.json({ error: "Wallpaper source is not allowed." }, { status: 403 });
  }

  const upstream = await fetch(source, {
    cache: "force-cache",
    redirect: "follow",
  });

  const contentType = upstream.headers.get("content-type")?.toLowerCase() ?? "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    return Response.json(
      { error: "The wallpaper image is temporarily unavailable." },
      { status: 502 },
    );
  }

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${safeFilename(requestUrl.searchParams.get("filename"))}"`,
    "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
    "X-Content-Type-Options": "nosniff",
  });

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { status: 200, headers });
}
