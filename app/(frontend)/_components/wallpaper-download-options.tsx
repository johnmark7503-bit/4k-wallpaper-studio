"use client";

import { Icon, type IconName } from "./icons";
import { trackFirebaseEvent } from "./firebase-analytics";

const deviceDownloads = [
  {
    key: "phone",
    label: "Phone",
    dimensions: "1440 × 3200",
    ratio: "9:20 portrait",
    icon: "phone",
  },
  {
    key: "tablet",
    label: "Tablet",
    dimensions: "2048 × 2732",
    ratio: "3:4 portrait",
    icon: "tablet",
  },
  {
    key: "laptop",
    label: "Laptop",
    dimensions: "2560 × 1600",
    ratio: "16:10 wide",
    icon: "laptop",
  },
  {
    key: "desktop",
    label: "Desktop 4K",
    dimensions: "3840 × 2160",
    ratio: "16:9 original",
    icon: "monitor",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  dimensions: string;
  ratio: string;
  icon: IconName;
}>;

function getDeviceSource(
  downloadSrc: string,
  device: string,
  downloadSources?: { phone: string; tablet: string; laptop: string; desktop: string },
) {
  if (downloadSources) return downloadSources[device as keyof typeof downloadSources];
  if (device === "desktop") return downloadSrc;
  return downloadSrc.replace(/-4k\.webp$/, `-${device}.webp`);
}

function getDownloadHref(source: string, slug: string, device: string) {
  // Public demo wallpapers already live on this origin. Linking to the real
  // asset keeps downloads working even when a host does not expose the API
  // route (otherwise the host's HTML fallback can be saved as a .webp file).
  if (source.startsWith("/")) return source;

  const search = new URLSearchParams({
    source,
    filename: `${slug}-${device}.webp`,
  });
  return `/api/wallpaper-download?${search.toString()}`;
}

export function WallpaperDownloadOptions({
  downloadSrc,
  downloadSources,
  slug,
}: {
  downloadSrc: string;
  downloadSources?: { phone: string; tablet: string; laptop: string; desktop: string };
  slug: string;
}) {
  return (
    <section className="deviceDownloads" aria-labelledby="device-download-title">
      <div className="deviceDownloadsHeading">
        <div>
          <p id="device-download-title">Choose your screen</p>
          <span>Every size is ready to fit its device.</span>
        </div>
        <span className="freePill">Free</span>
      </div>

      <div className="deviceDownloadGrid">
        {deviceDownloads.map((device) => {
          const source = getDeviceSource(downloadSrc, device.key, downloadSources);
          return (
            <a
              href={getDownloadHref(source, slug, device.key)}
              download={source.startsWith("/") ? `${slug}-${device.key}.webp` : undefined}
              className="deviceDownloadCard"
              aria-label={`Download ${device.label} wallpaper, ${device.dimensions}`}
              key={device.key}
              onClick={() => trackFirebaseEvent("wallpaper_download", {
                wallpaper_slug: slug,
                screen_format: device.key,
              })}
            >
              <span className="deviceIcon"><Icon name={device.icon} size={21} /></span>
              <span className="deviceDownloadCopy">
                <strong>{device.label}</strong>
                <small>{device.dimensions}</small>
              </span>
              <span className="deviceRatio">{device.ratio}</span>
              <Icon name="download" size={18} />
            </a>
          );
        })}
      </div>
    </section>
  );
}
