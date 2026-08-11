import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2StorageConfig, MEDIA_PREFIX } from "../../../../../cms/storage/r2";

export const runtime = "nodejs";

function safeKey(segments: string[]) {
  const decoded = segments.map((segment) => decodeURIComponent(segment));
  if (
    decoded.length < 2 ||
    decoded[0] !== MEDIA_PREFIX ||
    decoded.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\0"))
  ) {
    return null;
  }
  return decoded.join("/");
}

function client() {
  const r2 = getR2StorageConfig();
  return {
    bucket: r2.bucket,
    s3: new S3Client({
      region: "auto",
      endpoint: r2.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
      },
    }),
  };
}

async function redirectToObject(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
  headOnly = false,
) {
  let key: string | null = null;
  try {
    key = safeKey((await context.params).key);
  } catch {
    return Response.json({ error: "Invalid media path." }, { status: 400 });
  }
  if (!key) return Response.json({ error: "Invalid media path." }, { status: 400 });

  const { bucket, s3 } = client();
  const signed = await getSignedUrl(
    s3,
    headOnly
      ? new HeadObjectCommand({ Bucket: bucket, Key: key })
      : new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 900 },
  );
  const requestUrl = new URL(request.url);
  return new Response(null, {
    status: 307,
    headers: {
      location: signed,
      "cache-control": requestUrl.searchParams.has("download")
        ? "private, no-store"
        : "public, max-age=240, s-maxage=240, stale-while-revalidate=60",
      "x-content-type-options": "nosniff",
    },
  });
}

export function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  return redirectToObject(request, context);
}

export function HEAD(request: Request, context: { params: Promise<{ key: string[] }> }) {
  return redirectToObject(request, context, true);
}
