const DAILY_LIMIT = 3;
const COOKIE_NAME = "ws_ai_visitor";
const RIYADH_TIME_ZONE = "Asia/Riyadh";
const AI_PROVIDER = "gemini" as const;
const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";
const DEFAULT_GEMINI_IMAGE_SIZE = "2K";

const CREATE_QUOTA_TABLE = `
  CREATE TABLE IF NOT EXISTS ai_daily_quota (
    quota_key TEXT NOT NULL,
    quota_date TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (quota_key, quota_date)
  )
`;

type RuntimeEnv = {
  DB?: D1Database;
  GEMINI_API_KEY?: string;
  GEMINI_IMAGE_MODEL?: string;
  GEMINI_IMAGE_SIZE?: string;
};

type GeminiImageContent = {
  type?: string;
  data?: string;
  mime_type?: string;
};

type GeminiInteractionResponse = {
  steps?: Array<{
    type?: string;
    content?: GeminiImageContent[];
  }>;
  error?: {
    code?: number | string;
    message?: string;
    status?: string;
  };
};

type WallpaperTheme = {
  id: string;
  label: string;
  description: string;
  accent: string;
  textStart: string;
  textEnd: string;
  typography: "signature" | "bold" | "modern";
  visualPrompt: string;
};

const wallpaperThemes: WallpaperTheme[] = [
  {
    id: "obsidian-gold",
    label: "Obsidian Gold",
    description: "Bold luxury · warm gold",
    accent: "#f6c65b",
    textStart: "#fff4bd",
    textEnd: "#d79121",
    typography: "signature",
    visualPrompt:
      "deep obsidian marble, elegant molten-gold veins, restrained warm glow, black mineral depth, luxury editorial lighting",
  },
  {
    id: "aurora-cyan",
    label: "Aurora Cyan",
    description: "Calm energy · cool cyan",
    accent: "#66f3ff",
    textStart: "#f8feff",
    textEnd: "#72dbea",
    typography: "modern",
    visualPrompt:
      "midnight arctic atmosphere, flowing cyan aurora ribbons, glassy reflections, deep navy shadows, quiet cinematic wonder",
  },
  {
    id: "celestial-violet",
    label: "Celestial Violet",
    description: "Creative depth · violet light",
    accent: "#b28cff",
    textStart: "#ffffff",
    textEnd: "#bda8ff",
    typography: "bold",
    visualPrompt:
      "abstract celestial orbit, velvety violet nebula, subtle silver stardust, dark cosmic depth, refined futuristic composition",
  },
  {
    id: "emerald-mist",
    label: "Emerald Mist",
    description: "Natural poise · rich emerald",
    accent: "#72e7b5",
    textStart: "#f4fff9",
    textEnd: "#86d9b4",
    typography: "modern",
    visualPrompt:
      "emerald forest mist rendered as elegant abstract layers, soft botanical light, charcoal shadows, premium natural serenity",
  },
  {
    id: "ruby-ember",
    label: "Ruby Ember",
    description: "Confident heat · ruby red",
    accent: "#ff786f",
    textStart: "#fff4ee",
    textEnd: "#ef765d",
    typography: "bold",
    visualPrompt:
      "dark volcanic glass with controlled ruby embers, sculptural smoke, dramatic rim light, powerful but sophisticated energy",
  },
  {
    id: "silver-monolith",
    label: "Silver Monolith",
    description: "Clean focus · liquid silver",
    accent: "#c7e8ef",
    textStart: "#ffffff",
    textEnd: "#adc5cc",
    typography: "modern",
    visualPrompt:
      "minimal liquid-silver architecture, dark graphite background, polished reflections, precise geometric calm, premium industrial design",
  },
  {
    id: "rose-quartz",
    label: "Rose Quartz",
    description: "Soft elegance · rose glow",
    accent: "#ffb5d2",
    textStart: "#fff8fb",
    textEnd: "#efa7c3",
    typography: "signature",
    visualPrompt:
      "smoky rose-quartz crystal atmosphere, blush light through dark glass, delicate pearl highlights, elegant fashion editorial mood",
  },
  {
    id: "ocean-sapphire",
    label: "Ocean Sapphire",
    description: "Deep calm · sapphire blue",
    accent: "#6eb8ff",
    textStart: "#f3f9ff",
    textEnd: "#73b6f2",
    typography: "bold",
    visualPrompt:
      "deep sapphire ocean light, translucent wave forms, midnight blue gradients, subtle caustic highlights, cinematic underwater calm",
  },
];

async function getRuntimeEnv() {
  const { env: workerBinding } = await import("cloudflare:workers");
  const workerEnv = workerBinding as unknown as RuntimeEnv;
  return {
    ...workerEnv,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? workerEnv.GEMINI_API_KEY,
    GEMINI_IMAGE_MODEL:
      process.env.GEMINI_IMAGE_MODEL ?? workerEnv.GEMINI_IMAGE_MODEL ?? DEFAULT_GEMINI_IMAGE_MODEL,
    GEMINI_IMAGE_SIZE:
      process.env.GEMINI_IMAGE_SIZE ?? workerEnv.GEMINI_IMAGE_SIZE ?? DEFAULT_GEMINI_IMAGE_SIZE,
  };
}

function getRiyadhDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RIYADH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getQuotaWindow(now = new Date()) {
  const { year, month, day } = getRiyadhDateParts(now);
  return {
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    resetAt: new Date(Date.UTC(year, month - 1, day + 1, -3)).toISOString(),
  };
}

function parseCookies(header: string | null) {
  const cookies = new Map<string, string>();
  for (const item of header?.split(";") ?? []) {
    const separator = item.indexOf("=");
    if (separator === -1) continue;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (key) cookies.set(key, value);
  }
  return cookies;
}

function getVisitor(request: Request) {
  const current = parseCookies(request.headers.get("cookie")).get(COOKIE_NAME);
  const visitorId = current && /^[a-zA-Z0-9_-]{24,128}$/.test(current)
    ? current
    : `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
  return { visitorId, isNew: visitorId !== current };
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function visitorCookie(visitorId: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`;
}

function jsonResponse(
  request: Request,
  visitorId: string,
  body: Record<string, unknown>,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Set-Cookie", visitorCookie(visitorId, request));
  return new Response(JSON.stringify(body), { status, headers });
}

async function ensureQuotaTable(database: D1Database) {
  await database.prepare(CREATE_QUOTA_TABLE).run();
}

async function getUsedCount(database: D1Database, quotaKey: string, dateKey: string) {
  const row = await database
    .prepare("SELECT used FROM ai_daily_quota WHERE quota_key = ?1 AND quota_date = ?2")
    .bind(quotaKey, dateKey)
    .first<{ used: number }>();
  return row?.used ?? 0;
}

async function reserveGeneration(database: D1Database, quotaKey: string, dateKey: string) {
  const row = await database
    .prepare(`
      INSERT INTO ai_daily_quota (quota_key, quota_date, used, updated_at)
      VALUES (?1, ?2, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(quota_key, quota_date) DO UPDATE SET
        used = ai_daily_quota.used + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE ai_daily_quota.used < ?3
      RETURNING used
    `)
    .bind(quotaKey, dateKey, DAILY_LIMIT)
    .first<{ used: number }>();
  return row?.used ?? null;
}

async function releaseGeneration(database: D1Database, quotaKey: string, dateKey: string) {
  await database
    .prepare(`
      UPDATE ai_daily_quota
      SET used = CASE WHEN used > 0 THEN used - 1 ELSE 0 END,
          updated_at = CURRENT_TIMESTAMP
      WHERE quota_key = ?1 AND quota_date = ?2
    `)
    .bind(quotaKey, dateKey)
    .run();
}

function normalizeName(input: unknown) {
  if (typeof input !== "string") return null;
  const name = input.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!name || name.length > 20) return null;
  if (!/^[\p{L}\p{M}\p{N} .'-]+$/u.test(name)) return null;
  return name;
}

function chooseTheme(name: string) {
  let hash = 2166136261;
  for (const character of name.toLocaleLowerCase("en-US")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return wallpaperThemes[hash % wallpaperThemes.length];
}

function buildBackgroundPrompt(theme: WallpaperTheme) {
  return [
    "Create a premium original abstract wallpaper background.",
    `Visual direction: ${theme.visualPrompt}.`,
    "Use a center-safe composition that crops beautifully to both a very tall phone screen and a 16:9 desktop screen.",
    "Keep the most important texture and light within the central 55 percent, with calm negative space at the exact center for a name overlay.",
    "Rich depth, realistic materials, elegant cinematic lighting, clean luxury finish, no busy clutter.",
    "Background only: absolutely no words, letters, numbers, monograms, logos, signatures, watermarks, people, faces, characters, brands, or recognizable copyrighted properties.",
  ].join(" ");
}

function normalizeGeminiImageSize(value: string | undefined) {
  return value === "1K" || value === "2K" || value === "4K" ? value : DEFAULT_GEMINI_IMAGE_SIZE;
}

function extractGeminiImage(result: GeminiInteractionResponse) {
  for (let stepIndex = (result.steps?.length ?? 0) - 1; stepIndex >= 0; stepIndex -= 1) {
    const step = result.steps?.[stepIndex];
    if (step?.type !== "model_output") continue;
    for (let contentIndex = (step.content?.length ?? 0) - 1; contentIndex >= 0; contentIndex -= 1) {
      const content = step.content?.[contentIndex];
      if (content?.type === "image" && content.data) {
        return {
          data: content.data,
          mimeType: content.mime_type?.startsWith("image/") ? content.mime_type : "image/jpeg",
        };
      }
    }
  }
  return null;
}

async function requestBackground(
  apiKey: string,
  prompt: string,
  model: string,
  imageSize: string,
) {
  const requestBody = JSON.stringify({
    model,
    input: prompt,
    response_format: {
      type: "image",
      delivery: "inline",
      mime_type: "image/jpeg",
      aspect_ratio: "1:1",
      image_size: normalizeGeminiImageSize(imageSize),
    },
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Api-Revision": "2026-05-20",
        "Content-Type": "application/json",
      },
      body: requestBody,
      signal: AbortSignal.timeout(115_000),
    });
    const result = (await response.json()) as GeminiInteractionResponse;
    const image = extractGeminiImage(result);
    if (response.ok && image) return image;

    const providerCode = result.error?.status || result.error?.code || `gemini_${response.status}`;
    console.error("Gemini wallpaper generation failed", {
      status: response.status,
      code: providerCode,
      requestId: response.headers.get("x-goog-request-id") ?? response.headers.get("x-request-id"),
      attempt: attempt + 1,
    });

    const canRetry = attempt === 0 && response.status >= 500;
    if (!canRetry) throw new Error(String(providerCode));
    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  throw new Error("gemini_unknown");
}

export async function GET(request: Request) {
  const { visitorId } = getVisitor(request);
  const { DB, GEMINI_API_KEY } = await getRuntimeEnv();
  const { dateKey, resetAt } = getQuotaWindow();
  const providerState = { provider: AI_PROVIDER, configured: Boolean(GEMINI_API_KEY) };

  if (!DB) {
    return jsonResponse(
      request,
      visitorId,
      { ...providerState, message: "AI studio is temporarily unavailable." },
      503,
    );
  }

  try {
    await ensureQuotaTable(DB);
    const quotaKey = await sha256Hex(`visitor:${visitorId}`);
    const used = await getUsedCount(DB, quotaKey, dateKey);
    return jsonResponse(request, visitorId, {
      ...providerState,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - used),
      resetAt,
    });
  } catch {
    return jsonResponse(
      request,
      visitorId,
      { ...providerState, message: "AI studio is temporarily unavailable." },
      503,
    );
  }
}

export async function POST(request: Request) {
  const { visitorId } = getVisitor(request);
  const runtime = await getRuntimeEnv();
  const { dateKey, resetAt } = getQuotaWindow();

  if (!runtime.DB || !runtime.GEMINI_API_KEY) {
    return jsonResponse(
      request,
      visitorId,
      {
        provider: AI_PROVIDER,
        configured: false,
        message: "Gemini image generation is waiting for secure admin setup.",
      },
      503,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(request, visitorId, { message: "Please enter a valid name." }, 400);
  }

  const name = normalizeName((payload as { name?: unknown })?.name);
  if (!name) {
    return jsonResponse(
      request,
      visitorId,
      { message: "Enter 1–20 letters or numbers. Basic spaces, dots, apostrophes and hyphens are allowed." },
      400,
    );
  }

  const quotaKey = await sha256Hex(`visitor:${visitorId}`);
  let reserved = false;

  try {
    await ensureQuotaTable(runtime.DB);
    const used = await reserveGeneration(runtime.DB, quotaKey, dateKey);
    if (used === null) {
      const retryAfter = Math.max(1, Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000));
      return jsonResponse(
        request,
        visitorId,
        { message: "You have used all 3 free AI wallpapers for today.", limit: DAILY_LIMIT, remaining: 0, resetAt },
        429,
        { "Retry-After": String(retryAfter) },
      );
    }
    reserved = true;

    const theme = chooseTheme(name);
    const image = await requestBackground(
      runtime.GEMINI_API_KEY,
      buildBackgroundPrompt(theme),
      runtime.GEMINI_IMAGE_MODEL,
      runtime.GEMINI_IMAGE_SIZE,
    );

    const publicTheme = {
      id: theme.id,
      label: theme.label,
      description: theme.description,
      accent: theme.accent,
      textStart: theme.textStart,
      textEnd: theme.textEnd,
      typography: theme.typography,
    };
    return jsonResponse(request, visitorId, {
      provider: AI_PROVIDER,
      configured: true,
      image: `data:${image.mimeType};base64,${image.data}`,
      theme: publicTheme,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - used),
      resetAt,
    });
  } catch (error) {
    if (reserved) {
      try {
        await releaseGeneration(runtime.DB, quotaKey, dateKey);
      } catch {
        // Preserve the original generation error; quota recovery can be inspected separately.
      }
    }

    const code = error instanceof Error ? error.message : "unknown";
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    const isModerationBlock = code === "SAFETY" || code === "BLOCKED" || code === "INVALID_ARGUMENT";
    const isOwnerQuotaBlock =
      code === "RESOURCE_EXHAUSTED" || code === "PERMISSION_DENIED" || code === "UNAUTHENTICATED";
    if (isTimeout) {
      console.error("Gemini wallpaper generation timed out");
    }
    const message = isModerationBlock
      ? "This request could not be generated. Try a different name."
      : isOwnerQuotaBlock
        ? "AI generation is temporarily paused. Please try again later."
      : isTimeout
        ? "The AI studio took too long. Your free attempt was not used—please try again."
        : "The AI studio could not finish this design. Your free attempt was not used—please try again.";
    return jsonResponse(request, visitorId, { message }, 503);
  }
}
