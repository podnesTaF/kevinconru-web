# Client Plan — Public Website (Next.js App Router)

Pixel-faithful rebuild of the approved prototype as a data-driven Next.js 16 site. The prototype
(`planning/design-reference/`) is the **visual source of truth**: `styles.css` is the spec for every
dimension, color, font, and animation; `pages.jsx` / `pages2.jsx` are the component reference.
Do **not** port the prototype's hash router / UMD / global-`window` structure — rebuild idiomatically.

> Read first: `01-getting-started/03-layouts-and-pages.md`, `04-linking-and-navigating.md`,
> `05-server-and-client-components.md`, `12-images.md`, `13-fonts.md`, `14-metadata-and-og-images.md`,
> and `02-guides/instant-navigation.md`.

---

## 1. Routes (App Router, `src/app/(site)/`)

| Route | File | Notes |
| --- | --- | --- |
| `/` | `(site)/page.tsx` | Home: hero, marquee, 3 featured publications, about teaser. |
| `/publications` | `(site)/publications/page.tsx` | Index grid + region filter (Client island). |
| `/publications/[slug]` | `(site)/publications/[slug]/page.tsx` | Detail: cover, specs, plates, lightbox, next-title. `await params`. |
| `/about` | `(site)/about/page.tsx` | Bio, films, chronology, affiliations, contact (`#contact` anchor). |

- `(site)/layout.tsx` renders **Nav + Footer + palette provider**; pages are **async Server
  Components** reading the query layer (backend.md §2). The filter, lightbox, palette switcher,
  mobile menu, scroll-state nav, and YouTube facade are the only **Client Components**.
- `generateStaticParams()` for publication slugs; `generateMetadata()` per publication.
- `not-found.tsx` + a `loading.tsx` (skeletons) per segment.
- Evaluate exporting **`unstable_instant`** on these routes for instant client nav (docs flag it
  repeatedly; the site is small and mostly static, so this should be cheap and worthwhile).

---

## 2. Styling foundation — do this first

Resolve the bootstrap conflict (overview §3) before any component work.

**Recommended: Tailwind v4, CSS-first.**
1. Delete `tailwind.config.js` + `postcss.config.js`; keep `postcss.config.mjs` with
   `@tailwindcss/postcss`. Remove `tailwindcss@3` + `autoprefixer` from deps.
2. Rewrite `globals.css` to port the prototype's token system into `@theme` + base layers:
   - **Palettes via `[data-palette]`** on `<html>`: port the three token blocks from `styles.css`
     verbatim — `--bg, --bg-alt, --fg, --fg-soft, --muted, --rule, --rule-soft, --sage, --sage-deep,
     --terra, --terra-deep, --plate, --plate-grad`. `bone` is `:root` default.
   - **Locked type pairing** (`editorial`): `--f-display: Instrument Serif`, `--f-body: Geist`,
     `--f-mono: JetBrains Mono`, `--display-tracking`, `--display-weight`. (Drop the `modern`/`literary`
     switches — not user-facing.)
   - Port global bits: reset, `::selection`, the **SVG paper-grain** `body::before` (and its `ink`
     variant), `.display/.eyebrow/.serif-italic` helpers, and the page/`fade-up` transitions
     **including the `prefers-reduced-motion` and `.no-anim` safeties**.
3. **Fonts** via `next/font/google` in the root layout: `Instrument_Serif` (weight 400 + italic),
   `Geist`, `JetBrains_Mono` → expose as CSS vars (`--f-display` etc.) so the token system above
   resolves. (Replaces the prototype's `<link>` to Google Fonts and the bootstrap's Geist setup.)

> Either Tailwind utilities **or** a ported CSS module can express the layout — the prototype is
> plain CSS, so a faithful approach is a global stylesheet of the prototype's classes plus Tailwind
> for new admin UI. Pick one and stay consistent; the **measurements in `styles.css` are
> authoritative** regardless.

---

## 3. Components (`src/components/`)

Mapped from the prototype. **Server** unless marked **(client)**.

- **`Nav`** (client) — sticky, blur, `is-scrolled` after 12px; brand mark = circular crop of
  `logo.jpg`; links Index/Publications/About with active-underline; "Get in touch" CTA → About
  `#contact`; mobile full-screen sheet. Use `next/link` + `usePathname()` for active state.
- **`Footer`** — 4 columns (brand+tagline+socials, Index, Contact, Elsewhere). **Facebook +
  Instagram only** (LinkedIn removed per brief). Wyvern Research link. Contact/socials from
  `SiteSettings`.
- **`PaletteSwitcher`** (client) — sets `document.documentElement.dataset.palette`, persists to
  `localStorage`, restores on load (inline pre-hydration script in `<head>` to avoid flash). Options:
  `bone / sage / ink`. Place subtly (e.g. footer or a small fixed control).
- **`PubCover`** — typographic cover from `coverBg/coverFg`; if `coverImage`, reveal the object photo
  on hover (`.pc-image` opacity). Reused on Home featured, index grid, detail hero.
- **`PublicationCard`** — index grid item (cover + title/sub/year), hover lift.
- **`RegionFilter`** (client) — pills All/Oceania/Polynesia/Melanesia/Africa; filters the list
  (Oceania groups Polynesia+Melanesia). Filtering can be pure client over server-passed data, or
  `searchParams`-driven (`?region=`) for shareable URLs — prefer `searchParams`.
- **`Lightbox`** (client) — full-screen plate viewer; Esc/←/→ keys; image + metadata side panel.
- **`FilmEmbed`** (client) — YouTube **facade**: poster (`img.youtube.com/vi/{id}/maxresdefault.jpg`)
  → swap to `<iframe …?autoplay=1&start=…>` on click. Null `youtubeId` ⇒ "coming soon" tile.
- **`RichText`** — renders sanitized TipTap HTML (`prose` styling tuned to the editorial type).
- **`Marquee`** — infinite credibility strip from `SiteSettings.marquee`.
- **`LinkArrow`**, **`ArrowRight`** — shared CTA/icon.

---

## 4. Page-by-page (content + layout from the prototype)

### Home (`pages.jsx` → `Home`)
- **Hero** (`default` variant only): eyebrow "Dealer · Curator · Publisher — Brussels", display
  title "African & *Oceanic* art.", bio lede, **stats** (10 Publications / 6 Exhibitions / 2 Films
  — from `SiteSettings.heroStats`), CTA. Right: dark **plate** that cross-fades object photos
  (`object-mask` ↔ `object-headdress`) every 7s with the `plate-info` caption. Respect reduced-motion.
- **Marquee** band.
- **Featured** — 3 featured publications (`feat-card`), hover lift/scale.
- **About teaser** — grayscale portrait + serif copy + "Read more".

### Publications index (`pages2.jsx` → `Publications`)
- Header (display "Publications" + intro), toolbar (count + region pills), responsive
  `pubs-grid` (3→2→1 cols) of `PublicationCard` with staggered `fade-up`.

### Publication detail (`pages2.jsx` → `PublicationDetail`)
- Crumb → `/publications`. `pd-hero`: cover + title/subtitle/lead + **specs** (Year/Pages/Publisher/
  Region) + "Enquire" mailto. **Selected plates** grid (→ Lightbox) when present. **Next title**
  footer (cycles list). `await params`; `notFound()` on bad slug.

### About (`pages2.jsx` → `About`)
- `ab-hero` (grayscale portrait + name + role line + lede). **Biography** with serif drop-cap
  (exact bio text from `requirements.txt`/`SiteSettings.bio`). **Moving image** = `films-grid` of
  `FilmEmbed` (Ontong Java w/ start=45, Surrealism, Oldman "coming soon"). **Selected chronology**
  (`TimelineEntry`). **Affiliations** (incl. Wyvern advisor link). **Contact** block (`#contact`):
  tel, email, Facebook · Instagram.

---

## 5. Images & media

- All DB-backed images render through **`next/image`** (`fill` + the prototype's `object-fit` /
  `padding` per surface). Configure `remotePatterns` for the GCS bucket (backend.md §3).
- Object photos sit on the dark `--plate` ground with `object-fit: contain` + inner padding;
  portraits use `object-fit: cover` + `grayscale(1) contrast(1.04)`.
- Provide `alt` from `Media.alt`. Seed assets live in `public/seed/` for first-run/local dev.

---

## 6. SEO, a11y, performance

- `metadata` in root + per route; `generateMetadata` for publications (title/desc/OG from cover).
- `opengraph-image.tsx` (optional) using the type-driven cover; `sitemap.ts` + `robots.ts`.
- Semantic landmarks, focus-visible, keyboard lightbox, `prefers-reduced-motion` honored everywhere,
  contrast checked across all 3 palettes (esp. `ink`).
- Mostly static → prerender + tag-based revalidation; lazy-load YouTube via facade; audit Lighthouse.

---

## 7. Client build checklist

- [ ] Resolve Tailwind/PostCSS; port palettes + type tokens + grain + transitions into `globals.css`.
- [ ] Fonts via `next/font/google` → CSS vars.
- [ ] `(site)/layout.tsx` with Nav, Footer, PaletteSwitcher (no-flash restore).
- [ ] Home (hero cross-fade, marquee, featured, teaser).
- [ ] Publications index + `RegionFilter` (`searchParams`).
- [ ] Publication detail + Lightbox + `generateStaticParams`/`generateMetadata`.
- [ ] About (bio drop-cap, films facade, chronology, affiliations, contact).
- [ ] `loading.tsx` skeletons, `not-found.tsx`, metadata/sitemap.
- [ ] Cross-palette + reduced-motion + responsive + a11y pass; evaluate `unstable_instant`.
