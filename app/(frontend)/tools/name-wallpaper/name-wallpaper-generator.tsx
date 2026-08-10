"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackFirebaseEvent } from "../../_components/firebase-analytics";

const wallpaperFormats = {
  phone: { label: "Phone", dimensions: "1440 × 3200", width: 1440, height: 3200 },
  tablet: { label: "Tablet", dimensions: "2048 × 2732", width: 2048, height: 2732 },
  laptop: { label: "Laptop", dimensions: "2560 × 1600", width: 2560, height: 1600 },
  desktop: { label: "Desktop 4K", dimensions: "3840 × 2160", width: 3840, height: 2160 },
} as const;

type WallpaperFormat = keyof typeof wallpaperFormats;

type WallpaperTheme = {
  id: string;
  label: string;
  description: string;
  accent: string;
  textStart: string;
  textEnd: string;
  typography: "signature" | "bold" | "modern";
};

type QuotaPayload = {
  provider?: "gemini";
  configured?: boolean;
  limit?: number;
  remaining?: number;
  resetAt?: string;
  message?: string;
};

type GenerationPayload = QuotaPayload & {
  image?: string;
  theme?: WallpaperTheme;
  error?: string;
};

const sampleTheme: WallpaperTheme = {
  id: "sample",
  label: "Studio sample",
  description: "Generate to reveal your unique style",
  accent: "#f6c65b",
  textStart: "#fff4bd",
  textEnd: "#d79121",
  typography: "signature",
};

const sampleBackground = "/generator/name-black-gold-portrait.webp";
const previewMaxEdge = 1000;

const generationStages = [
  "Matching a premium visual mood…",
  "Painting original light and texture…",
  "Balancing phone and desktop crops…",
  "Finishing your private studio result…",
];

const staticImageCache = new Map<string, Promise<HTMLImageElement>>();

function loadCanvasImage(source: string) {
  const createImage = () =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to load wallpaper artwork"));
      image.src = source;
    });

  const cached = staticImageCache.get(source);
  if (cached) return cached;
  const loading = createImage();
  staticImageCache.set(source, loading);
  return loading;
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const targetRatio = width / height;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (imageRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
  }

  context.drawImage(
    image,
    (image.naturalWidth - sourceWidth) / 2,
    (image.naturalHeight - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
}

function drawReadabilityLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const centerShade = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.55,
  );
  centerShade.addColorStop(0, "rgba(0, 3, 6, 0.12)");
  centerShade.addColorStop(0.5, "rgba(0, 4, 8, 0.04)");
  centerShade.addColorStop(1, "rgba(0, 3, 6, 0.48)");
  context.fillStyle = centerShade;
  context.fillRect(0, 0, width, height);

  const vignette = context.createLinearGradient(0, 0, 0, height);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0.32)");
  vignette.addColorStop(0.3, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.7, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.38)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function fitFontSize(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  typography: WallpaperTheme["typography"],
) {
  const maxWidth = width * (width > height ? 0.72 : 0.82);
  let fontSize = Math.min(width * (width > height ? 0.15 : 0.2), height * 0.22);
  const fontFamily = typography === "signature"
    ? 'Georgia, "Times New Roman", serif'
    : 'Arial, Helvetica, sans-serif';
  const fontStyle = typography === "signature" ? "italic 700" : typography === "modern" ? "650" : "800";
  const minimum = Math.max(28, Math.min(width, height) * 0.055);

  while (fontSize > minimum) {
    context.font = `${fontStyle} ${Math.round(fontSize)}px ${fontFamily}`;
    if (context.measureText(text).width <= maxWidth) break;
    fontSize *= 0.92;
  }

  return { fontSize: Math.round(fontSize), fontFamily, fontStyle };
}

function drawName(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  name: string,
  theme: WallpaperTheme,
) {
  const displayName = name.trim() || "Your Name";
  const { fontSize, fontFamily, fontStyle } = fitFontSize(
    context,
    displayName,
    width,
    height,
    theme.typography,
  );
  const textGradient = context.createLinearGradient(
    width * 0.5,
    height * 0.42,
    width * 0.5,
    height * 0.58,
  );
  textGradient.addColorStop(0, theme.textStart);
  textGradient.addColorStop(0.5, "#ffffff");
  textGradient.addColorStop(1, theme.textEnd);

  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.direction = /[\u0600-\u06ff\u0750-\u077f]/.test(displayName) ? "rtl" : "ltr";
  context.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
  context.lineJoin = "round";
  context.lineWidth = Math.max(2, Math.min(width, height) * 0.0038);
  context.strokeStyle = "rgba(0, 5, 8, 0.82)";
  context.shadowColor = theme.accent;
  context.shadowBlur = Math.round(Math.min(width, height) * 0.019);
  context.strokeText(displayName, width / 2, height * 0.5);
  context.fillStyle = textGradient;
  context.fillText(displayName, width / 2, height * 0.5);

  const underlineWidth = Math.min(context.measureText(displayName).width * 0.62, width * 0.42);
  const underlineY = height * 0.5 + fontSize * 0.62;
  context.shadowBlur = Math.round(Math.min(width, height) * 0.01);
  context.strokeStyle = theme.accent;
  context.lineWidth = Math.max(2, Math.min(width, height) * 0.0018);
  context.beginPath();
  context.moveTo(width / 2 - underlineWidth / 2, underlineY);
  context.bezierCurveTo(
    width / 2 - underlineWidth * 0.16,
    underlineY + fontSize * 0.12,
    width / 2 + underlineWidth * 0.18,
    underlineY - fontSize * 0.1,
    width / 2 + underlineWidth / 2,
    underlineY,
  );
  context.stroke();
  context.restore();
}

async function paintWallpaper(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  source: string,
  theme: WallpaperTheme,
  name: string,
) {
  const image = await loadCanvasImage(source);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return false;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  drawImageCover(context, image, width, height);
  drawReadabilityLayer(context, width, height);
  drawName(context, width, height, name, theme);
  return true;
}

function previewDimensions(format: WallpaperFormat) {
  const { width, height } = wallpaperFormats[format];
  const scale = Math.min(1, previewMaxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function cleanName(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function isValidName(value: string) {
  return Boolean(value && value.length <= 20 && /^[\p{L}\p{M}\p{N} .'-]+$/u.test(value));
}

export function NameWallpaperGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);
  const generatedObjectUrlRef = useRef("");
  const [name, setName] = useState("Tayyab");
  const [format, setFormat] = useState<WallpaperFormat>("phone");
  const [backgroundSource, setBackgroundSource] = useState(sampleBackground);
  const [theme, setTheme] = useState<WallpaperTheme>(sampleTheme);
  const [generatedForName, setGeneratedForName] = useState("");
  const [dailyLimit, setDailyLimit] = useState(3);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [resetAt, setResetAt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const normalizedName = cleanName(name);
  const hasFreshGeneration = Boolean(generatedForName && generatedForName === normalizedName);

  const renderPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const renderId = ++renderIdRef.current;
    const dimensions = previewDimensions(format);

    try {
      const painted = await paintWallpaper(
        canvas,
        dimensions.width,
        dimensions.height,
        backgroundSource,
        theme,
        name,
      );
      return renderId === renderIdRef.current && painted;
    } catch {
      return false;
    }
  }, [backgroundSource, format, name, theme]);

  useEffect(() => {
    void renderPreview();
  }, [renderPreview]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/cms-api/ai/name-wallpaper", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => ({ response, body: (await response.json()) as QuotaPayload }))
      .then(({ response, body }) => {
        if (!response.ok) throw new Error(body.message || "Quota unavailable");
        if (typeof body.configured === "boolean") setIsConfigured(body.configured);
        if (typeof body.limit === "number") setDailyLimit(body.limit);
        if (typeof body.remaining === "number") setRemaining(body.remaining);
        if (body.resetAt) setResetAt(body.resetAt);
        if (body.configured === false) {
          setStatusMessage("Gemini is ready for secure admin setup. Generation will unlock after the API key is added.");
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatusMessage("Daily allowance will be checked when you generate.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    if (!generatedObjectUrlRef.current) return;
    staticImageCache.delete(generatedObjectUrlRef.current);
    URL.revokeObjectURL(generatedObjectUrlRef.current);
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    const timer = window.setInterval(() => {
      setGenerationStage((current) => Math.min(current + 1, generationStages.length - 1));
    }, 11_000);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const generateWallpaper = async () => {
    const requestName = cleanName(name);
    if (!isValidName(requestName)) {
      setStatusMessage("Enter 1–20 letters or numbers. Basic spaces, dots, apostrophes and hyphens are allowed.");
      return;
    }
    if (remaining === 0) {
      setStatusMessage(`You have used all ${dailyLimit} free AI wallpapers for today.`);
      return;
    }

    setIsGenerating(true);
    setGenerationStage(0);
    setStatusMessage("");
    try {
      trackFirebaseEvent("name_wallpaper_generate", { screen_format: format });
      const response = await fetch("/cms-api/ai/name-wallpaper", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: requestName }),
      });
      const body = (await response.json()) as GenerationPayload;
      if (typeof body.configured === "boolean") setIsConfigured(body.configured);
      if (typeof body.limit === "number") setDailyLimit(body.limit);
      if (typeof body.remaining === "number") setRemaining(body.remaining);
      if (body.resetAt) setResetAt(body.resetAt);
      if (!response.ok || !body.image || !body.theme) {
        throw new Error(body.message || body.error || "The AI studio could not finish this design.");
      }

      const imageBlob = await (await fetch(body.image)).blob();
      const nextObjectUrl = URL.createObjectURL(imageBlob);
      if (generatedObjectUrlRef.current) {
        staticImageCache.delete(generatedObjectUrlRef.current);
        URL.revokeObjectURL(generatedObjectUrlRef.current);
      }
      generatedObjectUrlRef.current = nextObjectUrl;
      setBackgroundSource(nextObjectUrl);
      setTheme(body.theme);
      setGeneratedForName(requestName);
      trackFirebaseEvent("name_wallpaper_success", { screen_format: format, vibe: body.theme.id });
      setStatusMessage(`${body.theme.label} was created for ${requestName}. Choose a screen and download it.`);
    } catch (error) {
      trackFirebaseEvent("name_wallpaper_failed", { screen_format: format });
      setStatusMessage(error instanceof Error ? error.message : "The AI studio could not finish this design.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadWallpaper = async () => {
    if (!hasFreshGeneration) {
      setStatusMessage("Generate a fresh AI design for this name before downloading.");
      return;
    }

    setIsDownloading(true);
    setStatusMessage("");
    try {
      const selectedFormat = wallpaperFormats[format];
      const exportCanvas = document.createElement("canvas");
      const painted = await paintWallpaper(
        exportCanvas,
        selectedFormat.width,
        selectedFormat.height,
        backgroundSource,
        theme,
        normalizedName,
      );
      if (!painted) throw new Error("Wallpaper could not be prepared.");

      const blob = await new Promise<Blob | null>((resolve) => exportCanvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Wallpaper could not be prepared.");
      const safeName = normalizedName.toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu, "-") || "custom";
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${safeName}-${format}-ai-wallpaper.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1200);
      setStatusMessage(`${selectedFormat.label} wallpaper downloaded. Other sizes remain free.`);
      trackFirebaseEvent("name_wallpaper_download", { screen_format: format, vibe: theme.id });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Wallpaper could not be prepared.");
    } finally {
      setIsDownloading(false);
    }
  };

  const resetLabel = resetAt
    ? new Date(resetAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "Riyadh midnight";

  return (
    <div className="generatorWorkspace aiGeneratorWorkspace">
      <form
        className="generatorControls aiGeneratorControls"
        onSubmit={(event) => {
          event.preventDefault();
          void generateWallpaper();
        }}
      >
        <div
          className="aiStudioStatus"
          data-configured={isConfigured === null ? "checking" : isConfigured ? "yes" : "no"}
        >
          <span><i aria-hidden="true" /> Gemini Studio</span>
          <strong>
            {remaining === null
              ? "Checking…"
              : isConfigured === false
                ? "Setup pending"
                : `${remaining} of ${dailyLimit} free today`}
          </strong>
        </div>

        <div className="controlGroup aiNameControl">
          <label htmlFor="wallpaper-name">Type your name</label>
          <input
            id="wallpaper-name"
            value={name}
            maxLength={20}
            autoComplete="off"
            spellCheck="false"
            onChange={(event) => {
              setName(event.target.value);
              setStatusMessage("");
            }}
            placeholder="e.g. Tayyab"
            aria-describedby="name-generator-help"
          />
          <small id="name-generator-help">{name.length}/20 · English, Urdu, Arabic and other writing systems supported</small>
        </div>

        <div className="aiPromiseCard">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>One name in. One original design out.</strong>
            <p>Gemini turns your name into a unique premium visual world. The studio adds the exact spelling afterward so every result stays sharp and correct.</p>
          </div>
        </div>

        <button
          className="primaryButton aiGenerateButton"
          type="submit"
          disabled={isGenerating || remaining === 0 || isConfigured === false}
          aria-busy={isGenerating}
        >
          {isGenerating
            ? generationStages[generationStage]
            : isConfigured === false
              ? "Gemini setup pending"
              : hasFreshGeneration
                ? "Create another AI design"
                : "Generate my AI wallpaper"}
        </button>

        {generatedForName ? (
          <div className="aiThemeResult">
            <span style={{ backgroundColor: theme.accent }} aria-hidden="true" />
            <div>
              <small>AI visual match</small>
              <strong>{theme.label}</strong>
              <p>{theme.description}</p>
            </div>
          </div>
        ) : null}

        <fieldset className="controlGroup">
          <legend>Choose your screen</legend>
          <div className="optionGrid formatOptions">
            {(Object.keys(wallpaperFormats) as WallpaperFormat[]).map((formatKey) => (
              <label className="optionCard formatOptionCard" key={formatKey}>
                <input
                  type="radio"
                  name="format"
                  value={formatKey}
                  checked={format === formatKey}
                  onChange={() => {
                    setFormat(formatKey);
                    setStatusMessage("");
                  }}
                />
                <span>{wallpaperFormats[formatKey].label}</span>
                <small>{wallpaperFormats[formatKey].dimensions}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          className="secondaryButton generatorDownload"
          type="button"
          onClick={() => void downloadWallpaper()}
          disabled={!hasFreshGeneration || isGenerating || isDownloading}
        >
          {isDownloading ? "Preparing high-resolution PNG…" : `Download ${wallpaperFormats[format].label} PNG`}
        </button>

        <div className="aiLimitNote">
          <span>{dailyLimit} successful generations daily</span>
          <span>Resets {resetLabel}</span>
          <span>Downloads never use quota</span>
        </div>
        <p className="downloadMessage" role="status" aria-live="polite">{statusMessage}</p>
      </form>

      <div
        className={`canvasFrame ${format}Canvas ${isGenerating ? "aiCanvasGenerating" : ""}`}
        aria-busy={isGenerating || isDownloading}
      >
        <div className="canvasPreviewTopline">
          <span>{hasFreshGeneration ? "Your AI wallpaper" : "Studio sample"}</span>
          <strong>{hasFreshGeneration ? theme.label : "Generate to personalize"}</strong>
        </div>
        <div className="aiCanvasStage">
          <canvas ref={canvasRef} aria-label={`Live ${format} preview of the name wallpaper for ${normalizedName || "your name"}`} />
          {isGenerating ? (
            <div className="generationOverlay" aria-live="polite">
              <span className="generationSpinner" aria-hidden="true" />
              <strong>{generationStages[generationStage]}</strong>
              <p>Original artwork can take up to two minutes.</p>
            </div>
          ) : null}
          {!hasFreshGeneration && !isGenerating ? (
            <div className="sampleBadge">Sample preview</div>
          ) : null}
        </div>
        <p>{wallpaperFormats[format].dimensions} · High-resolution PNG export</p>
      </div>
    </div>
  );
}
