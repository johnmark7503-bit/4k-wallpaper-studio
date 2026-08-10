"use client";

import { useState } from "react";

type ImportState = "idle" | "running" | "done" | "error";

export default function SeedDemoPage() {
  const [state, setState] = useState<ImportState>("idle");
  const [message, setMessage] = useState("Ready to import the launch content into Payload CMS.");

  async function request(body: Record<string, unknown>) {
    const response = await fetch("/cms-api/seed-demo", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Import request failed.");
    return result;
  }

  async function startImport() {
    setState("running");
    try {
      let offset = 0;
      let done = false;
      while (!done) {
        const result = await request({ stage: "media", offset, limit: 3 });
        offset = result.nextOffset;
        done = result.done;
        setMessage(`Uploading media ${Math.min(offset, result.total)} of ${result.total}…`);
      }
      setMessage("Creating categories, collections, wallpapers and blog posts…");
      const result = await request({ stage: "content" });
      setMessage(`Import complete: ${result.wallpapers} wallpapers, ${result.media} media files, ${result.categories} categories, ${result.collections} collections and ${result.blogPosts} blog posts.`);
      setState("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
      setState("error");
    }
  }

  return (
    <main id="main-content" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px" }}>
      <section style={{ width: "min(680px, 100%)", padding: "40px", border: "1px solid #24323b", borderRadius: "20px", background: "#071017" }}>
        <p className="eyebrow">Administrator utility</p>
        <h1 style={{ marginTop: "12px" }}>Import launch content</h1>
        <p style={{ marginTop: "16px", color: "#a8b5bd", lineHeight: 1.7 }}>{message}</p>
        <button className="primaryButton" style={{ marginTop: "28px" }} type="button" onClick={startImport} disabled={state === "running" || state === "done"}>
          {state === "running" ? "Importing…" : state === "done" ? "Import complete" : state === "error" ? "Retry import" : "Start secure import"}
        </button>
        <p style={{ marginTop: "18px", color: "#74838d", fontSize: "14px" }}>You must be logged into /studio as an Administrator. Existing records are preserved and duplicates are skipped.</p>
      </section>
    </main>
  );
}
