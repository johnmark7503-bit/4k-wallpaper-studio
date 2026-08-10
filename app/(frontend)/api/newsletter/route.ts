const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CREATE_FALLBACK_TABLE = `
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    source TEXT NOT NULL DEFAULT 'website',
    consented_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return response({ ok: false, message: "Please enter a valid email address." }, 400);
  }

  const email =
    typeof data === "object" && data && "email" in data
      ? String(data.email).trim().toLowerCase()
      : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return response({ ok: false, message: "Please enter a valid email address." }, 400);
  }

  if (process.env.DATABASE_URL && process.env.PAYLOAD_SECRET) {
    try {
      const endpoint = new URL("/cms-api/newsletter-subscribers", request.url);
      const cmsResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          status: "active",
          source: "website",
          consentedAt: new Date().toISOString(),
        }),
      });
      if (!cmsResponse.ok) {
        const error = (await cmsResponse.json().catch(() => null)) as { errors?: unknown[] } | null;
        if (cmsResponse.status === 400 && error?.errors?.length) {
          return response({ ok: true, message: "You’re already on the list." }, 200);
        }
        throw new Error("CMS rejected signup");
      }
      return response({ ok: true, message: "You’re on the list. Watch your inbox for the next drop." }, 201);
    } catch {
      return response({ ok: false, message: "Signup is temporarily unavailable. Please try again shortly." }, 503);
    }
  }

  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB) throw new Error("DB unavailable");
    await env.DB.prepare(CREATE_FALLBACK_TABLE).run();
    await env.DB
      .prepare(
        "INSERT OR IGNORE INTO newsletter_subscribers (email, status, source, consented_at) VALUES (?1, 'active', 'website', CURRENT_TIMESTAMP)",
      )
      .bind(email)
      .run();
    return response({ ok: true, message: "You’re on the list. Watch your inbox for the next drop." }, 201);
  } catch {
    return response({ ok: false, message: "Signup is temporarily unavailable. Please try again shortly." }, 503);
  }
}
