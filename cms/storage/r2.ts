import path from "node:path";

export const MEDIA_PREFIX = "wallpaper-studio";

export type MediaStorageProvider = "vercel-blob" | "r2";

export type R2StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  publicBaseUrl: string;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required when MEDIA_STORAGE_PROVIDER=r2.`);
  return value;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getMediaStorageProvider(): MediaStorageProvider {
  const requested = process.env.MEDIA_STORAGE_PROVIDER?.trim().toLowerCase();
  const r2Ready = [
    process.env.R2_ACCOUNT_ID,
    process.env.R2_ACCESS_KEY_ID,
    process.env.R2_SECRET_ACCESS_KEY,
    process.env.R2_BUCKET,
  ].every((value) => Boolean(value?.trim()));
  const autoActivate = process.env.R2_AUTO_ACTIVATE?.trim().toLowerCase() !== "false";

  // A Vercel deployment only reaches runtime after build-vercel.sh has copied
  // and checksum-verified every legacy Blob object. This makes activation
  // atomic: a failed migration fails the new deployment and leaves the current
  // production deployment on Vercel Blob.
  if (
    requested === "r2" ||
    (autoActivate && process.env.VERCEL_ENV === "production" && r2Ready)
  ) return "r2";
  return "vercel-blob";
}

export function getR2StorageConfig(): R2StorageConfig {
  const accountId = required("R2_ACCOUNT_ID");
  return {
    accountId,
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucket: required("R2_BUCKET"),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicBaseUrl: trimTrailingSlash(process.env.R2_PUBLIC_BASE_URL?.trim() || "/api/media"),
  };
}

export function getR2PublicFileUrl(publicBaseUrl: string, filename: string, prefix?: string) {
  const key = path.posix.join(prefix || MEDIA_PREFIX, filename);
  const encodedKey = key
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${trimTrailingSlash(publicBaseUrl)}/${encodedKey}`;
}
