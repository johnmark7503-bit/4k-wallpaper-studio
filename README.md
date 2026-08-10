# 4K Wallpaper Studio

Production-ready wallpaper publishing foundation with the Obsidian Cinematic public website, Payload CMS, PostgreSQL, Vercel Blob media storage and a separate lightweight Sites preview build.

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
- Vercel Blob media adapter
- Sitemap, robots rules and structured data
- Original copyright-safe demo artwork

## Environment

Copy `.env.example` to `.env.local` and fill the values locally. Never commit `.env.local` or any real credentials.

Required for the CMS:

- `PAYLOAD_SECRET`: long random authentication secret
- `DATABASE_URL`: PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for persistent uploads
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

## Security notes

- Real credentials are excluded by `.gitignore`.
- Only `.env.example` is intended for source control.
- Public readers can only receive published content.
- Admin sessions use Payload authentication, login throttling and role-based access.
- Original or properly licensed media must be confirmed during upload.
- Gemini credentials remain server-side environment variables and are never exposed in browser code.
