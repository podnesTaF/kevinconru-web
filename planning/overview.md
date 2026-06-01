# Kevin Conru — Implementation Plan (Overview)

A modern, editorial website for the African & Oceanic art dealer, curator and publisher
**Kevin Conru** (Brussels), plus a small content CMS so the site is fully data-driven.

This is the index for the planning set:

- **[overview.md](overview.md)** — stack, decisions, shared data model, env, GCS, roadmap *(this file)*
- **[client.md](client.md)** — the public website (Next.js App Router, pixel-faithful to the design)
- **[backend.md](backend.md)** — Prisma/Neon, GCS, auth, data-access layer, server actions
- **[admin.md](admin.md)** — the `/admin` content CMS

The approved design lives in **[design-reference/](design-reference/)** (the exported Claude Design
prototype: `Conru Website.html`, `styles.css`, `data.jsx`, `pages.jsx`, `pages2.jsx`, plus the
source `assets/`). **Treat the prototype as the visual source of truth** — recreate it pixel-perfectly;
do not copy its internal structure (it's UMD React + hash router + globals). The original brief is
`design-reference/requirements.txt`.

---

## 1. Confirmed decisions


| Decision           | Choice                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page structure** | 3 pages — Home, Publications (index + detail), About. About absorbs Films, chronology, affiliations and contact. Press folds into About/footer; Links fold into footer.            |
| **Theme**          | Public **palette switcher**: `bone` (default) / `sage` / `ink`, persisted in `localStorage`. Type pairing = `editorial` and hero = `default` are **locked** (not user-switchable). |
| **Admin**          | **Full content CMS** — Publications (+plates), Films, Press, About bio (rich text), Chronology, Affiliations, Contact/Settings, and a Media library.                               |
| **Media uploads**  | **V4 signed URLs** — browser uploads directly to the GCS bucket; server only mints the URL and records `Media` rows.                                                               |
| **Auth**           | Single admin (credentials), seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. NextAuth v5.                                                                                             |


---

## 2. Stack (already in `package.json`)

- **Next.js 16.2.6** (App Router, React 19.2). ⚠️ This is a newer Next than training data —
always check `node_modules/next/dist/docs/` before writing code. Key changes that affect us:
  - `params` / `searchParams` are **Promises** — `const { slug } = await params`.
  - Middleware is now `**proxy.ts`** (see `docs/01-app/01-getting-started/16-proxy.md`).
  - Mutations use **Server Functions** (`'use server'`); revalidate via `revalidatePath`/`revalidateTag`,
  or `refresh()` / `updateTag()` from `next/cache`.
  - `fetch` and DB reads are **not cached by default**; opt in with `use cache` or `<Suspense>`.
  - For snappy client nav, the docs repeatedly flag exporting `**unstable_instant`** from a route
  (see `docs/01-app/02-guides/instant-navigation.md`) — evaluate during the client build.
- **Prisma 7.8** with `**@prisma/adapter-neon`** (driver adapter) — client generated to
`src/generated/prisma` (see `prisma/schema.prisma`, `prisma.config.ts`).
- **Neon serverless Postgres** (`@neondatabase/serverless`).
- **NextAuth v5 beta** + `@auth/prisma-adapter`, `bcryptjs` for credential hashing.
- **Google Cloud Storage** (`@google-cloud/storage`) for all media.
- **Tailwind** + **TipTap** (rich text), **react-hook-form** + **zod** + `@hookform/resolvers`,
`clsx` + `tailwind-merge`.

---

## 3. ⚠️ Bootstrap inconsistencies to resolve first

The bootstrap commit left the styling stack in a contradictory state. **Resolve before building UI**
(details + recommendation in [client.md](client.md) §2):

1. **Tailwind v3 vs v4 mismatch.** `package.json` has *both* `tailwindcss@^3.4.19` and
  `@tailwindcss/postcss@^4`; `globals.css` uses the v4 `@import "tailwindcss"`; but
   `tailwind.config.js` is a v3-style config; and there are **two** PostCSS configs
   (`postcss.config.js` *and* `postcss.config.mjs`). Pick one major version. **Recommendation: commit**  
   **to Tailwind v3.** Keep `tailwind.config.js` + `postcss.config.js` (`tailwindcss` + `autoprefixer`),
   delete `postcss.config.mjs`, drop `@tailwindcss/postcss@4`, and replace the v4 `@import "tailwindcss"`
   (+ `@theme`) in `globals.css` with the v3 `@tailwind base; @tailwind components; @tailwind utilities;`
   directives.
2. **Design-token divergence.** `tailwind.config.js` encodes a *different* art direction
  (Cormorant Garamond / Inter Tight / `ochre`) than the approved design
   (**Instrument Serif / Geist / JetBrains Mono**, with **terracotta + sage** accents on a **bone**
   ground). The approved prototype wins — port `styles.css` tokens, not the bootstrap config.
3. **Fonts.** Load via `next/font/google`: **Instrument Serif** (display, has italic), **Geist**
  (body/UI), **JetBrains Mono** (metadata/eyebrows). Newsreader is only needed if the `literary`
   type pairing is ever revived — skip for now.

---

## 4. Shared data model (canonical — see backend.md for the Prisma schema)

Everything the public site renders comes from these tables. All long-form copy is rich text (TipTap).

- `**Media`** — every uploaded asset (images + press PDFs). `key` (GCS object path), `url`
(public URL), `mimeType`, `width`, `height`, `alt`, `bytes`. Referenced by FK everywhere an
image/file appears.
- `**Publication**` — `slug`, `title`, `subtitle`, `year`, `pages`, `publisher`, `region` (enum),
`kind` (enum: Archive / Monograph / Exhibition catalogue), `summary` (rich text), `coverBg`,
`coverFg`, `coverImage` → Media?, `featured` (bool, for Home), `sortOrder`, `published`,
timestamps. Has many `**Plate**`.
- `**Plate**` — belongs to Publication. `title`, `region`, `dateText`, `materials`, `dimensions`,
`provenance`, `caption`, `image` → Media, `sortOrder`.
- `**Film**` — `title`, `year`, `youtubeId?`, `startSeconds?`, `intro` (rich text), `sortOrder`,
`published`. (Null `youtubeId` ⇒ "coming soon" poster, per prototype.)
- `**PressItem**` — `outlet`, `year`, `title`, `url?`, `file` → Media? (PDF), `sortOrder`, `published`.
- `**TimelineEntry**` — `year` (string, e.g. "2025"), `event`, `description` (rich text), `sortOrder`.
- `**Affiliation**` — `role` (e.g. Member/Advisor/MA), `name`, `url?`, `sortOrder`.
- `**SiteSettings**` (singleton) — bio (rich text, the About body), `roleLine`, hero stats,
marquee items, and contact block: `tel`, `telHref`, `email`, `facebook`, `instagram`, `city`.
- **NextAuth tables** — `User` (+ `passwordHash`), `Account`, `Session`, `VerificationToken`.

`Region` enum filter rule (from prototype): the "Oceania" filter matches
`Oceania | Polynesia | Melanesia`. Store the granular region; group at query time.

Seed content is fully specified in the prototype `data.jsx` (10 publications, 2 plate sets, 3 films,
4 press items, contact) and `requirements.txt` (the canonical About bio + contact + the extra
publications/films the client asked for).

---

## 5. Environment variables (`.env.local` already scaffolded)

```
DATABASE_URL / DIRECT_URL   # Neon (pooled + direct for migrations)
AUTH_SECRET / AUTH_URL      # NextAuth
ADMIN_EMAIL / ADMIN_PASSWORD# seeded initial admin
GCS_PROJECT_ID / GCS_BUCKET_NAME / GCS_CLIENT_EMAIL / GCS_PRIVATE_KEY
GCS_PUBLIC_URL_BASE         # "https://storage.googleapis.com" → public objects at {base}/{bucket}/{key}
```

`next.config.ts` must add `images.remotePatterns` for `storage.googleapis.com` (and any CDN domain)
so `next/image` can optimize bucket images. See backend.md §3.

---

## 6. Proposed project structure

```
src/
  app/
    (site)/                 # public site group — shares the editorial layout
      layout.tsx            # Nav + Footer + palette provider + fonts
      page.tsx              # Home
      publications/
        page.tsx            # index (with region filter)
        [slug]/page.tsx     # detail (+ plate lightbox)
      about/page.tsx
    (admin)/
      admin/
        layout.tsx          # auth guard + admin chrome
        page.tsx            # dashboard
        publications/...    # CRUD + plates
        films/ press/ about/ media/ settings/
        login/page.tsx
    api/
      auth/[...nextauth]/route.ts
      media/sign/route.ts   # mint V4 signed upload URL (or use a server action)
    layout.tsx              # root <html>; fonts
  components/               # shared UI (Nav, Footer, PubCover, Lightbox, FilmEmbed, RichText…)
  lib/
    db.ts                   # Prisma client (Neon adapter, singleton)
    auth.ts                 # NextAuth config + auth() helper
    gcs.ts                  # storage client + signed-URL + publicUrl()
    queries/                # read functions (cached) used by Server Components
    validation/             # zod schemas shared by forms + actions
    actions/                # 'use server' mutations (admin)
  generated/prisma/         # prisma client output (gitignored)
proxy.ts                    # route protection for /admin
public/seed/                # logo.jpg, portrait.jpg, object-mask.jpg, object-headdress.jpg
prisma/
  schema.prisma
  seed.ts                   # seeds admin + content from the prototype
```

---

## 7. Roadmap (suggested order)

1. **Foundations** — resolve the Tailwind/PostCSS conflict (§3); port design tokens + fonts;
  build the root + `(site)` layout (Nav, Footer, palette switcher, grain, transitions).
2. **Backend core** — Prisma schema + first migration; `db.ts` (Neon adapter); `gcs.ts`; auth + admin
  seed; `seed.ts` (publications/plates/films/press/about/settings from the prototype). *(backend.md)*
3. **Public site, static-data first** — build Home / Publications / detail / About against the seeded
  DB via the read layer. Pixel-match the prototype. *(client.md)*
4. **Admin** — auth/login, dashboard, Media library + signed-URL uploader, then CRUD per entity with
  ordering + publish toggles + TipTap. *(admin.md)*
5. **Polish** — SEO/metadata + OG images, sitemap, revalidation wiring, accessibility,
  reduced-motion, `unstable_instant` evaluation, Lighthouse pass, deploy.

---

## 8. Open items to confirm during build

- **Press PDFs**: link out to the file, or render an in-page viewer? (Plan assumes download/anchor.)
- **Image variants**: rely on `next/image` on-demand optimization (recommended), or pre-generate
sizes on upload? (Plan assumes `next/image`.)
- **Bucket access**: `GCS_PUBLIC_URL_BASE` implies public-read objects. Confirm uniform bucket-level
access + public read is acceptable; otherwise switch reads to signed GET URLs (backend.md §3).

