"use client";

import { useCallback, useEffect, useState } from "react";

type ScreenData = { viewport: string; display: string; ratio: string; recommendation: string };

export function ScreenResolutionChecker() {
  const [data, setData] = useState<ScreenData | null>(null);
  const [message, setMessage] = useState("");

  const measure = useCallback(() => {
    const ratio = window.devicePixelRatio || 1;
    const physicalWidth = Math.round(window.screen.width * ratio);
    const physicalHeight = Math.round(window.screen.height * ratio);
    const recommendation = physicalWidth >= 3000 || physicalHeight >= 2000
      ? "3840 × 2160 (4K landscape)"
      : "2560 × 1440 or larger";
    setData({
      viewport: `${window.innerWidth} × ${window.innerHeight} CSS pixels`,
      display: `${physicalWidth} × ${physicalHeight} estimated device pixels`,
      ratio: `${ratio.toFixed(2)}×`,
      recommendation,
    });
    setMessage("");
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  async function copy() {
    if (!data) return;
    await navigator.clipboard.writeText(data.recommendation);
    setMessage("Recommendation copied.");
  }

  return (
    <div className="screenChecker">
      <div className="screenIllustration" aria-hidden="true"><div><span>4K</span></div><p>Your screen</p></div>
      <div className="screenReadout">
        <p className="eyebrow">Live result</p>
        <h2>{data?.recommendation || "Measuring your screen…"}</h2>
        <dl>
          <div><dt>Browser viewport</dt><dd>{data?.viewport || "—"}</dd></div>
          <div><dt>Display estimate</dt><dd>{data?.display || "—"}</dd></div>
          <div><dt>Pixel ratio</dt><dd>{data?.ratio || "—"}</dd></div>
        </dl>
        <div className="screenActions"><button className="primaryButton compactButton" type="button" onClick={copy}>Copy recommendation</button><button className="secondaryButton compactButton" type="button" onClick={measure}>Measure again</button></div>
        <p className="downloadMessage" aria-live="polite">{message}</p>
        <small>Browser values are a practical estimate; operating-system scaling can change the reported result.</small>
      </div>
    </div>
  );
}
