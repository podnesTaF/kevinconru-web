# Admin Plan — Content CMS (`/admin`)

A small, single-admin CMS that makes the whole public site editable: Publications (+ plates), Films,
Press, the About bio, Chronology, Affiliations, Contact/Settings, and a Media library. Built with
the same stack — Server Components for reads, **Server Actions** for writes (backend.md §5),
**react-hook-form + zod** for forms, **TipTap** for rich text, **signed-URL** uploads to GCS.

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
- Admin chrome is plain, utilitarian Tailwind (not the editorial theme) — clarity over polish.

---

## 2. Information architecture

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

## 3. Forms — pattern

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

## 4. Media library + uploader (signed URL)

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

## 5. Entity editors

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

## 6. UX & safety details

- Confirm dialogs on destructive actions; "unsaved changes" guard on editors.
- Slug uniqueness + friendly errors surfaced via `fieldErrors`.
- Optimistic toggles with rollback on action failure.
- TipTap config: bold/italic, headings, lists, link, blockquote — store sanitized HTML; the public
  `RichText` renderer must sanitize on output too.
- Dashboard surfaces content counts and a "view live" link per entity for quick verification.

---

## 7. Admin build checklist

- [ ] `auth.ts` wired; `(admin)/admin/layout.tsx` guard; `login` page; `proxy.ts` redirect.
- [ ] zod schemas per entity in `lib/validation`.
- [ ] Server Actions per entity (auth + validate + revalidate) — backend.md §5.
- [ ] `MediaUploader` + `MediaPicker` + `/admin/media` (signed-URL flow end-to-end).
- [ ] Publications list + editor + nested Plates (reorder, toggles, cover preview).
- [ ] Films, Press editors.
- [ ] About (bio TipTap + stats + marquee), Chronology, Affiliations, Settings.
- [ ] Reusable RHF form scaffolding (`useActionState`, fieldErrors, toasts, reorder control).
- [ ] Dashboard; destructive-action confirms; verify public revalidation after each mutation.
