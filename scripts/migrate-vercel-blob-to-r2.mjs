import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { list } from "@vercel/blob";
import { createHash } from "node:crypto";

const PREFIX = "wallpaper-studio/";
const MARKER_KEY = `${PREFIX}.migration-complete.json`;
const apply = process.argv.includes("--apply");
const deepVerify = process.argv.includes("--deep-verify");
const checkMarker = process.argv.includes("--check-marker");
const writeMarker = process.argv.includes("--write-marker");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

const accountId = required("R2_ACCOUNT_ID");
const bucket = required("R2_BUCKET");
const blobToken = required("BLOB_READ_WRITE_TOKEN");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  },
});

async function r2Size(key) {
  try {
    const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return Number(result.ContentLength ?? -1);
  } catch (error) {
    if (error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) return -1;
    // Bucket-scoped R2 object tokens can return 403 for a missing key because
    // they do not expose bucket-list permission. Treat that response as
    // "missing" here; the subsequent Put/Get verification still fails closed
    // if the credentials themselves are invalid.
    if (error?.$metadata?.httpStatusCode === 403) return -1;
    throw error;
  }
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function readSource(blob) {
  const response = await fetch(blob.url);
  if (!response.ok) throw new Error(`Could not read ${blob.pathname}: HTTP ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  if (body.length !== blob.size) {
    throw new Error(`Source size changed for ${blob.pathname}: expected ${blob.size}, received ${body.length}.`);
  }
  return {
    body,
    contentType: blob.contentType || response.headers.get("content-type") || "application/octet-stream",
    hash: sha256(body),
  };
}

async function readR2(key) {
  const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!object.Body) throw new Error(`R2 returned an empty body for ${key}.`);
  return Buffer.from(await object.Body.transformToByteArray());
}

async function copyBlob(blob) {
  const key = blob.pathname;
  const existingSize = await r2Size(key);
  if (existingSize === blob.size && !deepVerify) {
    return { state: "verified", key, bytes: blob.size };
  }
  if (existingSize === blob.size && deepVerify) {
    const [source, r2Body] = await Promise.all([readSource(blob), readR2(key)]);
    if (source.hash === sha256(r2Body)) {
      return { state: "verified", key, bytes: blob.size };
    }
    if (!apply) return { state: "mismatched", key, bytes: blob.size };
    await uploadAndVerify(key, source);
    return { state: "copied", key, bytes: source.body.length };
  }
  if (!apply) return { state: existingSize < 0 ? "missing" : "mismatched", key, bytes: blob.size };

  const source = await readSource(blob);
  await uploadAndVerify(key, source);
  return { state: "copied", key, bytes: source.body.length };
}

async function uploadAndVerify(key, source) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: source.body,
    ContentLength: source.body.length,
    ContentType: source.contentType,
    CacheControl: "public, max-age=31536000, immutable",
    Metadata: { migratedFrom: "vercel-blob", sha256: source.hash },
  }));

  const copiedSize = await r2Size(key);
  if (copiedSize !== source.body.length) {
    throw new Error(`R2 verification failed for ${key}: expected ${source.body.length}, found ${copiedSize}.`);
  }
  const copiedBody = await readR2(key);
  if (sha256(copiedBody) !== source.hash) {
    throw new Error(`R2 checksum verification failed for ${key}.`);
  }
}

async function run() {
  if (checkMarker) {
    const markerSize = await r2Size(MARKER_KEY);
    process.stdout.write(markerSize >= 0 ? "R2 migration marker found.\n" : "R2 migration marker not found.\n");
    process.exitCode = markerSize >= 0 ? 0 : 2;
    return;
  }

  const totals = { source: 0, verified: 0, copied: 0, missing: 0, mismatched: 0, failed: 0, bytes: 0 };
  let cursor;

  do {
    const page = await list({ token: blobToken, prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      totals.source += 1;
      totals.bytes += blob.size;
      try {
        const result = await copyBlob(blob);
        totals[result.state] += 1;
        process.stdout.write(`${result.state.padEnd(10)} ${result.key}\n`);
      } catch (error) {
        totals.failed += 1;
        process.stderr.write(`failed     ${blob.pathname}: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  process.stdout.write(`${JSON.stringify({ mode: apply ? "apply" : "verify", deepVerify, ...totals }, null, 2)}\n`);
  const unresolved = totals.failed + totals.missing + totals.mismatched;
  if (apply ? totals.failed > 0 : unresolved > 0) {
    process.exitCode = 1;
    return;
  }

  if (writeMarker) {
    if (apply || !deepVerify) {
      throw new Error("--write-marker requires verification mode with --deep-verify.");
    }
    const marker = Buffer.from(`${JSON.stringify({
      completedAt: new Date().toISOString(),
      sourceObjects: totals.source,
      sourceBytes: totals.bytes,
      verification: "sha256",
    }, null, 2)}\n`);
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: MARKER_KEY,
      Body: marker,
      ContentLength: marker.length,
      ContentType: "application/json",
      CacheControl: "no-store",
    }));
    process.stdout.write("R2 migration marker written after deep verification.\n");
  }
}

await run();
