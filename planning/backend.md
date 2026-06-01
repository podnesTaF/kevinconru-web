# Backend Plan — Prisma / Neon · GCS · Auth · Data layer

Covers the database, the data-access layer, Google Cloud Storage, authentication, and the
server-side mutation layer (Server Actions) shared by the public site and the admin CMS.

> Read first: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`,
> `07-mutating-data.md`, `15-route-handlers.md`, and `02-guides/authentication.md`.
> Prisma 7 uses **driver adapters** (the Neon adapter), not the legacy `datasources` URL at runtime.

---

## 1. Database — Prisma 7 + Neon serverless

### 1.1 Client singleton — `src/lib/db.ts`

Prisma 7 generates to `src/generated/prisma` (already configured) and requires a driver adapter.
Use `@prisma/adapter-neon` so it runs on serverless/edge-friendly Neon.

```ts
import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- `DATABASE_URL` = Neon **pooled** connection (runtime). `DIRECT_URL` = direct (migrations only;
  `prisma.config.ts` `datasource.url` should point migrations at `DIRECT_URL`).
- Confirm the exact `@prisma/adapter-neon` v7 constructor against installed types before coding
  (API has shifted across versions — `PrismaNeon` vs `PrismaNeonHTTP`).

### 1.2 Schema — `prisma/schema.prisma`

Add to the existing generator/datasource blocks. Enums + models below.

```prisma
enum Region { Africa Oceania Polynesia Melanesia AfricaAndOceania }
enum PublicationKind { Archive Monograph ExhibitionCatalogue }
enum Role { ADMIN }

model Media {
  id        String   @id @default(cuid())
  key       String   @unique          // GCS object path, e.g. "publications/abc.jpg"
  url       String                     // public URL ({GCS_PUBLIC_URL_BASE}/{bucket}/{key})
  mimeType  String
  bytes     Int
  width     Int?
  height    Int?
  alt       String?
  createdAt DateTime @default(now())

  coverFor      Publication[] @relation("PublicationCover")
  plateImages   Plate[]
  pressFiles    PressItem[]
}

model Publication {
  id          String          @id @default(cuid())
  slug        String          @unique
  title       String
  subtitle    String?
  year        Int
  pages       Int?
  publisher   String?
  region      Region
  kind        PublicationKind
  summary     String          // rich-text HTML
  coverBg     String?         // CSS gradient (fallback typographic cover)
  coverFg     String?
  coverImage  Media?          @relation("PublicationCover", fields: [coverImageId], references: [id])
  coverImageId String?
  featured    Boolean         @default(false)
  published   Boolean         @default(true)
  sortOrder   Int             @default(0)
  plates      Plate[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([published, sortOrder])
}

model Plate {
  id            String      @id @default(cuid())
  publication   Publication @relation(fields: [publicationId], references: [id], onDelete: Cascade)
  publicationId String
  title         String
  region        String?
  dateText      String?
  materials     String?
  dimensions    String?
  provenance    String?
  caption       String?     // rich text or plain
  image         Media       @relation(fields: [imageId], references: [id])
  imageId       String
  sortOrder     Int         @default(0)

  @@index([publicationId, sortOrder])
}

model Film {
  id           String  @id @default(cuid())
  title        String
  year         Int
  youtubeId    String?            // null ⇒ "coming soon" poster
  startSeconds Int?
  intro        String             // rich text
  published    Boolean @default(true)
  sortOrder    Int     @default(0)
}

model PressItem {
  id        String  @id @default(cuid())
  outlet    String
  year      Int
  title     String
  url       String?
  file      Media?  @relation(fields: [fileId], references: [id])
  fileId    String?
  published Boolean @default(true)
  sortOrder Int     @default(0)
}

model TimelineEntry {
  id          String @id @default(cuid())
  year        String
  event       String
  description String          // rich text
  sortOrder   Int    @default(0)
}

model Affiliation {
  id        String  @id @default(cuid())
  role      String          // "Member" | "Advisor" | "MA" …
  name      String
  url       String?
  sortOrder Int     @default(0)
}

model SiteSettings {
  id         String @id @default("singleton")  // enforce one row
  bio        String          // rich-text About body
  roleLine   String          // "Dealer · Curator · Publisher · Double bassist"
  heroStats  Json            // [{num,label}]
  marquee    Json            // string[]
  tel        String
  telHref    String
  email      String
  facebook   String?
  instagram  String?
  city       String?
  updatedAt  DateTime @updatedAt
}

// ── NextAuth (Prisma adapter) ──
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  role          Role      @default(ADMIN)
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}
// Account, Session, VerificationToken — copy the canonical @auth/prisma-adapter models.
```

### 1.3 Migrations & seed

- `npx prisma migrate dev --name init` (uses `DIRECT_URL`).
- **`prisma/seed.ts`** (wire into `prisma.config.ts` or run with `tsx`):
  1. Upsert admin `User` from `ADMIN_EMAIL` + bcrypt-hashed `ADMIN_PASSWORD`.
  2. Upsert `SiteSettings` singleton (bio + contact from `requirements.txt`).
  3. Create `Media` rows for the four seed assets in `public/seed/` (upload them to GCS as part
     of seeding, or point `url` at `/seed/*` for first run and migrate to GCS later).
  4. Seed the 10 publications + 2 plate sets, 3 films, 4 press items, chronology, affiliations —
     all transcribed from `design-reference/data.jsx` + `pages2.jsx` + `requirements.txt`.
  Seed must be **idempotent** (`upsert` on `slug`/stable ids).

---

## 2. Data-access layer — `src/lib/queries/`

Server Components read through these (never inline Prisma in pages — keeps caching + auth uniform).
Wrap each in React `cache()` for per-request memoization; add `use cache` + `cacheLife`/`cacheTag`
where data is stable so pages can prerender (see `08-caching.md` / `caching-without-cache-components.md`).

Functions (public, `published: true` only):
- `getFeaturedPublications()` → first 3 featured, ordered.
- `getPublications(regionFilter?)` → all published; apply the Oceania-group rule in SQL/JS.
- `getPublicationBySlug(slug)` → with ordered plates (+ their Media); 404 if none → `notFound()`.
- `getFilms()`, `getPressItems()`, `getTimeline()`, `getAffiliations()`, `getSiteSettings()`.

Tag convention for targeted revalidation: `publications`, `publication:{slug}`, `films`, `press`,
`about`, `settings`, `media`. Mutations call `revalidateTag(...)` (see §5).

---

## 3. Google Cloud Storage — `src/lib/gcs.ts`

### 3.1 Client

```ts
import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY!.replace(/\\n/g, "\n"), // env stores escaped \n
  },
});
export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
export const publicUrl = (key: string) =>
  `${process.env.GCS_PUBLIC_URL_BASE}/${process.env.GCS_BUCKET_NAME}/${key}`;
```

### 3.2 V4 signed upload URL (chosen approach)

`getUploadUrl({ contentType, ext })`:
1. Auth-check (admin only).
2. Build a unique `key` (e.g. `${folder}/${cuid()}.${ext}`).
3. `bucket.file(key).getSignedUrl({ version: "v4", action: "write", expires: Date.now()+15*60_000, contentType })`.
4. Return `{ uploadUrl, key, publicUrl: publicUrl(key) }`.

Exposed as **either** a route handler `app/api/media/sign/route.ts` (POST) **or** a Server Action
called from the uploader. Browser does `PUT uploadUrl` with the exact `Content-Type`, then calls
the `createMedia` action to persist the `Media` row (with `width/height` measured client-side or via
a follow-up `sharp`-free metadata read).

### 3.3 Public reads & `next/image`

- Objects are public-read (per `GCS_PUBLIC_URL_BASE`). Add to `next.config.ts`:
  ```ts
  images: { remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com",
    pathname: `/${process.env.GCS_BUCKET_NAME}/**` }] }
  ```
- **If the bucket must stay private**, swap `publicUrl()` for short-lived signed **GET** URLs and
  generate them in the query layer (cache them shorter than their TTL). Flagged in overview §8.
- `deleteMedia(key)` removes the GCS object *and* the row (block/cascade if still referenced).

---

## 4. Authentication — NextAuth v5 + `auth()` — `src/lib/auth.ts`

- Providers: **Credentials** only (email + password). `authorize()` looks up `User` by email and
  `bcrypt.compare`s against `passwordHash`.
- Adapter: `@auth/prisma-adapter` on `db`. Session strategy **`jwt`** (Credentials provider can't use
  DB sessions). Put `role` on the token/session.
- Export `{ handlers, auth, signIn, signOut }`. Route handler:
  `app/api/auth/[...nextauth]/route.ts` → `export const { GET, POST } = handlers`.
- **`auth()`** is the single guard used in: the admin layout (server), every admin Server Action,
  and the signed-URL endpoint. Treat actions as publicly reachable POSTs — re-check on every call
  (per `07-mutating-data.md` warning).
- **`proxy.ts`** (Next 16's renamed middleware) gates `/admin/*` (redirect unauthenticated → `/admin/login`).
  Belt-and-suspenders with the layout check; the layout check is authoritative.

---

## 5. Mutations — Server Actions — `src/lib/actions/`

One `'use server'` module per entity (`publications.ts`, `films.ts`, `press.ts`, `about.ts`,
`media.ts`, `settings.ts`). Every action:

1. `const session = await auth(); if (session?.user?.role !== "ADMIN") throw …`
2. Validate input with the shared **zod** schema (`src/lib/validation/*`, reused by the form).
3. Prisma write (transaction for parent+children, e.g. publication + plate reordering).
4. `revalidateTag(...)` the affected tags (+ `revalidatePath` for `/` and `/publications/[slug]`).
5. Return a typed result `{ ok: true } | { ok: false, fieldErrors }` for `useActionState`.

Action surface (CRUD + ordering + publish toggle) per entity:
- Publications: `create / update / delete / setPublished / reorder`, plus plate sub-actions
  `addPlate / updatePlate / deletePlate / reorderPlates`.
- Films / Press / Timeline / Affiliations: `create / update / delete / reorder` (+ publish where present).
- Settings/About: `updateSettings`, `updateBio`.
- Media: `createMedia` (after signed upload), `updateAlt`, `deleteMedia`, `getUploadUrl`.

---

## 6. Backend build checklist

- [ ] Resolve Prisma 7 + `@prisma/adapter-neon` constructor against installed types.
- [ ] `db.ts` singleton; confirm `prisma.config.ts` migrations use `DIRECT_URL`.
- [ ] Finalize schema; `migrate dev --name init`; generate client.
- [ ] `gcs.ts` (client, `publicUrl`, signed upload/delete).
- [ ] `auth.ts` + `[...nextauth]` route + `proxy.ts`.
- [ ] zod schemas in `lib/validation`.
- [ ] Server Actions per entity with auth + validation + revalidation.
- [ ] Query layer with `cache()` + tags.
- [ ] Idempotent `seed.ts` (admin + full prototype content); upload seed assets to GCS.
- [ ] `next.config.ts` `images.remotePatterns` for the bucket.
