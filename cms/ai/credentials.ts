import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "gemini-key:v1";
export const MASKED_API_KEY = "••••••••••••••••••••••••";

function encryptionKey() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error("PAYLOAD_SECRET is required before an AI key can be stored.");
  return createHash("sha256").update(secret).digest();
}

export function isEncryptedAPIKey(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(`${PREFIX}:`);
}

export function encryptAPIKey(value: string) {
  const apiKey = value.trim();
  if (apiKey.length < 20) throw new Error("Enter a valid Google AI Studio API key.");

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptAPIKey(value: string) {
  if (!isEncryptedAPIKey(value)) return "";
  const [, , ivValue, tagValue, encryptedValue] = value.split(":");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
