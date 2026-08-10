"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackFirebaseEvent } from "../../_components/firebase-analytics";

const formats = {
  desktop: { label: "Desktop 4K", width: 3840, height: 2160 },
  phone: { label: "Phone", width: 1440, height: 2560 },
} as const;

type Format = keyof typeof formats;

export function GradientWallpaperMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [firstColor, setFirstColor] = useState("#04121a");
  const [secondColor, setSecondColor] = useState("#6d28d9");
  const [angle, setAngle] = useState(135);
  const [format, setFormat] = useState<Format>("desktop");
  const [message, setMessage] = useState("");

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const selected = formats[format];
    canvas.width = selected.width;
    canvas.height = selected.height;
    const context = canvas.getContext("2d");
    if (!context) return;
    const radians = (angle * Math.PI) / 180;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const length = Math.abs(canvas.width * Math.cos(radians)) + Math.abs(canvas.height * Math.sin(radians));
    const x = Math.cos(radians) * length * 0.5;
    const y = Math.sin(radians) * length * 0.5;
    const gradient = context.createLinearGradient(centerX - x, centerY - y, centerX + x, centerY + y);
    gradient.addColorStop(0, firstColor);
    gradient.addColorStop(1, secondColor);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const glow = context.createRadialGradient(canvas.width * 0.72, canvas.height * 0.3, 0, canvas.width * 0.72, canvas.height * 0.3, canvas.width * 0.45);
    glow.addColorStop(0, "rgba(255,255,255,0.16)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [angle, firstColor, format, secondColor]);

  useEffect(() => { render(); }, [render]);

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `studio-gradient-${format}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      setMessage("Your high-resolution gradient is ready.");
      trackFirebaseEvent("gradient_wallpaper_download", { screen_format: format });
    }, "image/png");
  }

  return (
    <div className="generatorWorkspace">
      <form className="generatorControls" onSubmit={(event) => event.preventDefault()}>
        <div className="colorControl"><label htmlFor="first-color">First color</label><div><input id="first-color" type="color" value={firstColor} onChange={(event) => { setFirstColor(event.target.value); setMessage(""); }} /><span>{firstColor}</span></div></div>
        <div className="colorControl"><label htmlFor="second-color">Second color</label><div><input id="second-color" type="color" value={secondColor} onChange={(event) => { setSecondColor(event.target.value); setMessage(""); }} /><span>{secondColor}</span></div></div>
        <div className="rangeControl"><label htmlFor="gradient-angle">Angle <span>{angle}°</span></label><input id="gradient-angle" type="range" min="0" max="360" value={angle} onChange={(event) => { setAngle(Number(event.target.value)); setMessage(""); }} /></div>
        <fieldset className="controlGroup"><legend>Screen format</legend><div className="optionGrid formatOptions">{(Object.keys(formats) as Format[]).map((key) => <label className="optionCard" key={key}><input type="radio" name="gradient-format" checked={format === key} onChange={() => setFormat(key)} /><span>{formats[key].label}</span></label>)}</div></fieldset>
        <button className="primaryButton generatorDownload" type="button" onClick={download}>Download PNG</button>
        <p className="downloadMessage" aria-live="polite">{message}</p>
      </form>
      <div className={`canvasFrame ${format === "phone" ? "phoneCanvas" : ""}`}><canvas ref={canvasRef} aria-label="Live preview of your gradient wallpaper" /><p>{formats[format].width} × {formats[format].height} PNG</p></div>
    </div>
  );
}
