"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Icon } from "./icons";
import { trackFirebaseEvent } from "./firebase-analytics";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    if (!email) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await result.json()) as { message?: string };
      setMessage(payload.message ?? "Signup could not be completed.");
      if (result.ok) {
        form.reset();
        trackFirebaseEvent("newsletter_signup", { status: "success" });
      } else {
        trackFirebaseEvent("newsletter_signup", { status: "failed" });
      }
    } catch {
      setMessage("Signup is temporarily unavailable. Please try again shortly.");
      trackFirebaseEvent("newsletter_signup", { status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="newsletterForm" onSubmit={submit}>
      <label className="srOnly" htmlFor="newsletter-email">Email address</label>
      <input id="newsletter-email" name="email" type="email" placeholder="you@example.com" required />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Joining…" : "Join free"} <Icon name="arrow" size={18} />
      </button>
      <p className="formMessage" aria-live="polite">{message}</p>
    </form>
  );
}
