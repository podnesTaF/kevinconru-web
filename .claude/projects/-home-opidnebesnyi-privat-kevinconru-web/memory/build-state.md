---
name: build-state
description: Roadmap status + key implementation decisions for the kevinconru-web build
metadata:
  type: project
---

The site is built across all 5 planning roadmap steps (planning/overview.md §7): foundations, backend core, public site, admin CMS, polish. `npm run build` + `npm run lint` are green.

Key decisions (non-obvious, not all in planning docs):
- **Tailwind v3** (not v4) — config-based; tokens map to palette CSS vars in `globals.css`.
- **Admin forms** use native `useActionState` + `FormData` + server-side zod (NOT react-hook-form, despite the plan) — simpler with Server Actions. TipTap/media values flow via hidden inputs.
- Client-safe action state lives in `lib/actions/types.ts` (importing it from the server-only `_shared.ts` pulls Prisma/auth into the browser bundle — keep them split).
- Admin is under route group `(admin)/admin/(authed)/` so `/admin/login` stays outside the auth guard.
- Prisma 7 client generated to `src/generated/prisma` (gitignored, no barrel `index` — import from `/client`); seeds run via **tsx**.
- **`unstable_instant` deliberately NOT adopted** — it requires enabling Cache Components + `use cache` + Suspense refactor (draft API); public pages are already static/SSG so prefetch covers nav. Instead, the `(site)/loading.tsx` was removed and `/publications` made fully static (client-side region filtering in `PublicationsBrowser`) so every public route is prefetched/cached; `experimental.staleTimes` extends the client cache. Note: auto-prefetch only runs in `next start`, not `next dev`.
- **GCS is verified working** (auth + public read; bucket `kevinconru` has `allUsers: objectViewer`). Media uploads go to GCS; public URL = `https://storage.googleapis.com/kevinconru/<key>`. `next.config.ts` derives the image host from `GCS_PUBLIC_URL_BASE`.
- **Dedicated `/films` and `/press` public pages** exist (films moved off `/about`); both are in the nav + footer. Press items render only published, linking `file.url` or `url`.
- **Publications have a `pdf` Media relation** (migration `add_publication_pdf`) — a downloadable book PDF, shown as "Read the book (PDF)" on the detail page, managed via a PDF `MediaPicker` in the admin form. `MediaPicker` renders a mime-type label for non-image media.
- **`scripts/import-wetransfer.ts`** (`npm run import:wetransfer [dir]`) — idempotent GCS uploader for media drops: skips existing objects, upserts Media by key, links covers/PDFs/press files. Gallery images land in the media library unassigned. The `wetransfer_*/` drop folders are gitignored.

Not done (need a real environment): Lighthouse audit, deploy. See [[env-db-state]].
