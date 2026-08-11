const MEDIA_PREFIX = "wallpaper-studio/";
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const CORS_EXPOSE_HEADERS = "Accept-Ranges, Content-Length, Content-Range, Content-Type, ETag, Last-Modified";

function corsHeaders(): HeadersInit {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, HEAD, OPTIONS",
    "access-control-allow-headers": "Range, If-Modified-Since, If-None-Match",
    "access-control-expose-headers": CORS_EXPOSE_HEADERS,
    "access-control-max-age": "86400",
  };
}

function errorResponse(message: string, status: number): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        ...corsHeaders(),
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function objectKey(pathname: string): string | null {
  const encoded = pathname.replace(/^\/+/, "");
  if (!encoded) return null;

  try {
    const key = encoded
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/");
    const segments = key.split("/");

    if (
      !key.startsWith(MEDIA_PREFIX) ||
      key.includes("\0") ||
      segments.some((segment) => !segment || segment === "." || segment === "..")
    ) {
      return null;
    }

    return key;
  } catch {
    return null;
  }
}

function writeObjectHeaders(object: R2Object, headers: Headers): void {
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("last-modified", object.uploaded.toUTCString());
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", IMMUTABLE_CACHE);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-expose-headers", CORS_EXPOSE_HEADERS);
  headers.set("x-content-type-options", "nosniff");
}

function normalizedRange(object: R2ObjectBody): { length: number; offset: number } | null {
  const range = object.range;
  if (!range) return null;

  if ("suffix" in range) {
    const length = Math.min(range.suffix, object.size);
    return { length, offset: object.size - length };
  }

  const offset = range.offset ?? 0;
  return { length: range.length ?? object.size - offset, offset };
}

async function serveHead(key: string, env: Env): Promise<Response> {
  const object = await env.MEDIA_BUCKET.head(key);
  if (!object) return errorResponse("Not found", 404);

  const headers = new Headers();
  writeObjectHeaders(object, headers);
  headers.set("content-length", String(object.size));
  return new Response(null, { status: 200, headers });
}

async function serveGet(request: Request, key: string, env: Env, ctx: ExecutionContext): Promise<Response> {
  const hasRange = request.headers.has("range");
  const hasCondition = request.headers.has("if-none-match") || request.headers.has("if-modified-since");
  const cache = await caches.open("wallpaper-studio-media-v1");
  const cacheKey = new Request(request.url, { method: "GET" });

  if (!hasRange && !hasCondition) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const object = await env.MEDIA_BUCKET.get(key, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (!object) return errorResponse("Not found", 404);

  const headers = new Headers();
  writeObjectHeaders(object, headers);

  if (!("body" in object)) {
    const status = hasCondition ? 304 : 412;
    return new Response(null, { status, headers });
  }

  const range = normalizedRange(object);
  let status = 200;
  if (range) {
    status = 206;
    headers.set("content-length", String(range.length));
    headers.set(
      "content-range",
      `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`,
    );
  } else {
    headers.set("content-length", String(object.size));
  }

  const response = new Response(object.body, { status, headers });
  if (status === 200 && !hasCondition) {
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        const response = errorResponse("Method not allowed", 405);
        response.headers.set("allow", "GET, HEAD, OPTIONS");
        return response;
      }

      const url = new URL(request.url);
      if (url.pathname === "/" || url.pathname === "/health") {
        return Response.json(
          { service: "4K Wallpaper Studio Media", status: "ok" },
          { headers: { ...corsHeaders(), "cache-control": "no-store" } },
        );
      }

      const key = objectKey(url.pathname);
      if (!key) return errorResponse("Invalid media path", 400);

      return request.method === "HEAD"
        ? await serveHead(key, env)
        : await serveGet(request, key, env, ctx);
    } catch (error) {
      console.error(JSON.stringify({
        message: "media request failed",
        error: error instanceof Error ? error.message : String(error),
        method: request.method,
        path: new URL(request.url).pathname,
      }));
      return errorResponse("Media service unavailable", 500);
    }
  },
} satisfies ExportedHandler<Env>;
