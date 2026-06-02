# Admin Plan — Content CMS (`/admin`)

A small, single-admin CMS that makes the whole public site editable: Publications (+ plates), Films,
Press, the About bio, Chronology, Affiliations, Contact/Settings, and a Media library. Built with
the same stack — Server Components for reads, **Server Actions** for writes (backend.md §5),
**react-hook-form + zod** for forms, **TipTap** for rich text, **signed-URL** uploads to GCS.

**The admin wears the same editorial skin as the public site** — same design tokens, fonts, palette,
and shared components (see §2). It should feel like the back-of-house of the same publication, not a
generic dashboard.

> Read first: `01-getting-started/07-mutating-data.md`, `02-guides/forms.md`,
> `02-guides/authentication.md`, `02-guides/data-security.md`.

---

## 1. Auth & shell

- **`(admin)/admin/login/page.tsx`** — email + password form → `signIn("credentials", …)`.
  No public sign-up; the only admin is seeded (backend.md §1.3).
- **`(admin)/admin/layout.tsx`** — server component: `const session = await auth()`; if not
  `ADMIN`, `redirect("/admin/login")`. Renders admin chrome (sidebar nav + sign-out + "view site").
  This layout check is the **authoritative** guard; `proxy.ts` adds a redirect at the edge.
- Every Server Action re-checks `auth()` independently (actions are reachable as raw POSTs).
- **Admin chrome uses the editorial design system** (§2) — bone paper ground, ink text, terracotta
  accent, Instrument Serif headings — tuned for density and editing ergonomics rather than the
  marketing-page drama.

---

## 2. Visual design — reuse the editorial system

The admin is **not** a separate visual language. It inherits the same tokens, fonts, and primitives
the public site builds in client.md §2, applied at a calmer, denser "workbench" scale.

**Shared foundation (reused as-is):**
- The same CSS-variable token system from `globals.css` / `tailwind.config.js` — `--bg, --bg-alt,
  --fg, --fg-soft, --muted, --rule, --rule-soft, --terra, --sage, --plate`. No new color palette.
- The same fonts: **Instrument Serif** for page/section titles, **Geist** for body + form controls,
  **JetBrains Mono** for labels, eyebrows, table headers, counts, timestamps.
- The same hairline-rule + bone-paper aesthetic: thin `--rule` borders, generous whitespace, square
  corners (`borderRadius: 0/sm`), `--terra` as the single action accent.
- **Palette**: the admin should default to and **lock to `bone`** for editing clarity (high contrast,
  no surprises). The public `PaletteSwitcher` is not shown in admin chrome. (Optional: allow `ink`
  as a personal "dark mode" for the admin only — nice-to-have, not required.)

**Admin chrome:**
- Left **sidebar** (or top bar on narrow screens): `CONRU` wordmark (mono/serif lockup) +
  "Editor" eyebrow; nav links styled like the site nav (active = `--terra` underline); footer with
  signed-in email, sign-out, and "View live site ↗".
- Page header pattern per screen: mono eyebrow ("№ — Publications") + Instrument Serif `display`
  title + primary action button — mirroring the site's `section-head`.

**Editorial form primitives** (build once in `src/components/admin/ui/`, reuse everywhere):
- `Field` (mono `--muted` uppercase label + Geist input, `--rule` underline/border, `--terra` focus
  ring), `Textarea`, `Select` (enum dropdowns), `Toggle` (publish/featured), `NumberField`,
  `RepeatableList` (stats/marquee/chronology rows), `ReorderList` (drag handle on `--rule` rows).
- `Button` variants: primary (filled `--fg`/`--terra`), ghost (mono, `--rule` border pill — like
  `.nav-cta`), destructive (terra-deep). `Card`/`Panel` with hairline borders for editor sections.
- **`RichTextEditor`** (TipTap) styled to match the public **`RichText`** output, so what the editor
  shows equals what renders. Reuse the site's `prose`/serif styling inside the editor surface.
- Tables/lists use mono column headers + serif titles + the site's thumbnail treatment (object
  photos on `--plate` ground, portraits grayscale) so admin previews read like the live cards.

**Reused public components** (render the real thing, not a stand-in): `PubCover` (live cover
preview in the Publications editor), `Lightbox` (plate preview), `FilmEmbed` poster (YouTube id
preview), `RichText` (preview pane). This guarantees WYSIWYG parity with the site.

> Net effect: forms, tables, and toggles are restyled with the editorial tokens; the *information
> density* is higher than the marketing pages, but the *visual language is identical*.

---

## 3. Information architecture

```
/admin                      Dashboard — counts + quick links + recent edits
/admin/publications         List (drag-reorder, published toggle, featured toggle)
/admin/publications/new     Create
/admin/publications/[id]    Edit + manage Plates (nested, reorderable)
/admin/films                List + create/edit (inline or modal)
/admin/press                List + create/edit
/admin/about                Bio (TipTap) + role line + hero stats + marquee
/admin/about/chronology     TimelineEntry CRUD + reorder
/admin/about/affiliations   Affiliation CRUD + reorder
/admin/settings             Contact block (tel, email, facebook, instagram, city)
/admin/media                Media library (grid, upload, alt-text, delete)
/admin/login                Sign in
```

---

## 4. Forms — pattern

One consistent pattern for every entity:

1. **zod schema** in `src/lib/validation/<entity>.ts` — the single source of truth, imported by both
   the client form (`zodResolver`) and the Server Action (server-side re-validation).
2. **`react-hook-form`** client form component; submit calls the entity's Server Action.
   Use **`useActionState`** for pending/disabled state + server `fieldErrors`; toast on success.
3. **Server Action** (backend.md §5): auth → `schema.parse` → Prisma write → `revalidateTag` →
   typed result. `redirect()` back to the list after create/delete.
4. After mutation, prefer `revalidateTag`/`revalidatePath` so the **public** site reflects edits;
   call `refresh()` to update the admin view.

**Reordering**: a lightweight drag list (or up/down buttons) posting an ordered id array to a
`reorder` action that writes `sortOrder` in a transaction. Used by publications, plates, films,
press, chronology, affiliations.

**Publish/featured toggles**: optimistic switch → `setPublished` / `setFeatured` action.

---

## 5. Media library + uploader (signed URL)

Central to the CMS — every image/PDF picker reuses it.

- **`MediaUploader`** (client):
  1. Pick file → call `getUploadUrl({ contentType, ext })` (action/route, backend.md §3.2).
  2. `PUT` the file directly to the returned signed `uploadUrl` (show progress).
  3. For images, read intrinsic `width/height` client-side (`createImageBitmap`/`<img>`).
  4. Call `createMedia({ key, url, mimeType, bytes, width, height, alt })` → persists `Media`.
- **`MediaPicker`** (client) — modal that lists existing `Media` (grid) or uploads a new one;
  returns a `mediaId`. Used by Publication cover, Plate image, Press file.
- **Library page** — grid with thumb, dimensions, mime, "copy URL", editable `alt`, delete
  (block if referenced; show where it's used).
- Accept images (`image/*`) and PDFs (`application/pdf`) only; cap size client-side.

---

## 6. Entity editors

### Publications (`/admin/publications`)
- **List**: cover thumb, title, year, region, kind, published/featured toggles, drag-reorder, edit, delete.
- **Editor**: title, slug (auto from title, editable + uniqueness check), subtitle, year, pages,
  publisher, `region` (enum select), `kind` (enum select), **summary** (TipTap), `coverBg`/`coverFg`
  (gradient + color, with live `PubCover` preview), `coverImage` (MediaPicker, optional), featured,
  published.
- **Plates** (nested on edit): add/edit/delete/reorder; each = title, region, dateText, materials,
  dimensions, provenance, caption, image (MediaPicker, required). Live thumbnail + lightbox preview.

### Films (`/admin/films`)
- title, year, `youtubeId` (or full URL → parse id), `startSeconds`, **intro** (TipTap), published,
  order. Live preview poster from the YouTube id; empty id ⇒ "coming soon".

### Press (`/admin/press`)
- outlet, year, title, `url` (optional external), `file` (MediaPicker → PDF, optional), published, order.

### About / Settings
- **`/admin/about`**: `bio` (TipTap, seeded with the canonical `requirements.txt` text), `roleLine`,
  `heroStats` (repeatable num/label), `marquee` (string list).
- **`/admin/about/chronology`**: TimelineEntry CRUD (year, event, description rich text) + reorder.
- **`/admin/about/affiliations`**: Affiliation CRUD (role, name, url) + reorder.
- **`/admin/settings`**: contact block — tel (+ derived `telHref`), email, facebook, instagram, city.
  Edits the `SiteSettings` singleton.

---

## 7. UX & safety details

- Confirm dialogs on destructive actions; "unsaved changes" guard on editors.
- Slug uniqueness + friendly errors surfaced via `fieldErrors`.
- Optimistic toggles with rollback on action failure.
- TipTap config: bold/italic, headings, lists, link, blockquote — store sanitized HTML; the public
  `RichText` renderer must sanitize on output too.
- Dashboard surfaces content counts and a "view live" link per entity for quick verification.

---

## 8. Admin build checklist

- [ ] `auth.ts` wired; `(admin)/admin/layout.tsx` guard (editorial chrome); `login` page; `proxy.ts` redirect.
- [ ] Editorial admin UI primitives in `components/admin/ui/` (Field/Select/Toggle/Button/ReorderList/
      RichTextEditor) using the shared design tokens + fonts; locked to `bone`.
- [ ] zod schemas per entity in `lib/validation`.
- [ ] Server Actions per entity (auth + validate + revalidate) — backend.md §5.
- [ ] `MediaUploader` + `MediaPicker` + `/admin/media` (signed-URL flow end-to-end).
- [ ] Publications list + editor + nested Plates (reorder, toggles, cover preview).
- [ ] Films, Press editors.
- [ ] About (bio TipTap + stats + marquee), Chronology, Affiliations, Settings.
- [ ] Reusable RHF form scaffolding (`useActionState`, fieldErrors, toasts, reorder control).
- [ ] Dashboard; destructive-action confirms; verify public revalidation after each mutation.
