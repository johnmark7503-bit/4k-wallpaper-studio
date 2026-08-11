# 4K Wallpaper Studio

Production-ready wallpaper publishing foundation with the Obsidian Cinematic public website, Payload CMS, PostgreSQL, provider-switchable media storage and a separate lightweight Sites preview build.

## Included

- Next.js 16 App Router public website
- Premium responsive homepage and multi-page wallpaper library
- Wallpaper, category, collection, blog and page content models
- Payload CMS admin at `/studio`
- Roles: administrator, editor and author
- Drafts, scheduled publishing, version history and trash
- Media library with card, Pinterest and social image sizes
- Phone, tablet, laptop and desktop 4K download fields
- SEO and Pinterest fields
- Homepage, site, advertisement and AI settings
- Newsletter signup persistence
- PostgreSQL Payload adapter
- Vercel Blob and Cloudflare R2 media adapters with a rollback-safe provider switch
- Sitemap, robots rules and structured data
- Original copyright-safe demo artwork

## Environment

Copy `.env.example` to `.env.local` and fill the values locally. Never commit `.env.local` or any real credentials.

Required for the CMS:

- `PAYLOAD_SECRET`: long random authentication secret
- `DATABASE_URL`: PostgreSQL connection string
- `MEDIA_STORAGE_PROVIDER`: keep `vercel-blob`; production auto-activates R2 only after build-time verification
- `R2_AUTO_ACTIVATE`: defaults to `true`; set `false` and redeploy for emergency Blob rollback
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token and migration source access
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`: server-only R2 access
- `R2_PUBLIC_BASE_URL`: optional `workers.dev` CDN URL; leave empty for the signed R2 gateway
- `NEXT_PUBLIC_SITE_URL`: canonical website URL

Optional tool configuration:

- `GEMINI_API_KEY`
- `GEMINI_IMAGE_MODEL`
- `GEMINI_IMAGE_SIZE`

## Local development

Install the locked dependencies:

```bash
npm ci
```

Run the complete Next.js + Payload application:

```bash
npm run dev:payload
```

Open the public site at `/` and Payload Admin at `/studio`. On a fresh database, Payload asks you to create the first administrator.

## Database workflow

Payload uses PostgreSQL and automatically syncs schema changes in local development. Before production schema changes, create and review a migration:

```bash
npm run payload -- migrate:create
npm run payload:migrate
```

The separate `drizzle/` migrations belong to the lightweight Sites preview quota and newsletter fallback database.

## Validation

```bash
npm run lint
npm run build:vercel
```

The Vercel build prepares Payload routes, generates the import map and types, runs the Next.js production build, and then cleans the temporary route materialization.

## Vercel deployment

`vercel.json` uses `npm run build:vercel`. Add all required environment variables in Vercel before the first deployment. Connect a PostgreSQL provider and Vercel Blob, run the Payload migrations, then create the first admin user at `/studio`.

## Zero-downtime R2 migration

Keep `MEDIA_STORAGE_PROVIDER=vercel-blob`. On a Vercel production build with all
R2 credentials present, `build-vercel.sh` automatically copies every legacy
Blob object, performs two SHA-256 verification passes, writes an R2 completion
marker, and only then builds the application with R2 active. A copy or checksum
failure fails the new deployment, leaving the current production deployment on
Vercel Blob. Source Blob objects are never deleted.

The R2 bucket stays private. Public files are streamed through the read-only
`r2-cdn-worker` on the account's free `workers.dev` subdomain, so the
rate-limited `r2.dev` development endpoint and a purchased custom domain are
both unnecessary. The Worker only exposes `wallpaper-studio/` objects and only
accepts `GET`, `HEAD`, and `OPTIONS` requests.

```bash
# Generate binding types and validate the domainless CDN bundle
npm run storage:r2:types
npm run storage:r2:check

# One-time Cloudflare setup after Wrangler login
npx wrangler r2 bucket create wallpaper-studio-4k
npm run storage:r2:cors
npm run storage:r2:deploy-cdn
```

Use the URL printed by the deploy command as `R2_PUBLIC_BASE_URL` in Vercel.
Until the Worker is available, leave that variable empty: `/api/media` creates
short-lived signed redirects and R2 serves the file bytes directly.
The bucket CORS rule only grants direct browser uploads to the production site
and local development; reads remain available through the CDN Worker.

```bash
# Preview missing/mismatched objects without writing
npm run storage:migrate:r2

# Copy missing objects and verify every copied byte with SHA-256
npm run storage:migrate:r2 -- --apply

# Final full source-vs-R2 checksum verification
npm run storage:migrate:r2 -- --deep-verify
```

Manual commands remain useful for audits, but the production build gate performs
the required copy and final verification automatically. Keep the Blob token and
source objects during the rollback window; removing old objects is a separate,
manual decision.

## Security notes

- Real credentials are excluded by `.gitignore`.
- Only `.env.example` is intended for source control.
- Public readers can only receive published content.
- Admin sessions use Payload authentication, login throttling and role-based access.
- Original or properly licensed media must be confirmed during upload.
- Gemini credentials remain server-side environment variables and are never exposed in browser code.
