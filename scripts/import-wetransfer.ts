// One-off, idempotent importer for the WeTransfer drop (covers, book PDFs,
// the press insert, and the gallery images). Uploads each asset to GCS (skips
// objects that already exist), upserts a Media row keyed by the GCS object
// path, then links covers/PDFs/press files to their entries.
//
// Run: `npm run import:wetransfer [path/to/folder]`
// Default folder: ./wetransfer_publications_2026-06-02_1355
//
// Safe to re-run: existing GCS objects are not re-uploaded, Media is upserted
// by key, and links are re-applied.
import { readFileSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set.");
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});
const BUCKET = process.env.GCS_BUCKET_NAME!;
const bucket = storage.bucket(BUCKET);
// Same-origin path; the next.config rewrite proxies /media/* to GCS.
const publicUrl = (key: string) => `/media/${key}`;

const ROOT = process.argv[2] ?? "wetransfer_publications_2026-06-02_1355";

type Link =
  | { model: "publication"; id: string; field: "coverImageId" | "pdfId" }
  | { model: "press"; id: string; field: "fileId" };

// Explicitly-mapped assets ------------------------------------------------
const ASSETS: {
  local: string;
  key: string;
  mime: string;
  alt: string;
  link: Link;
}[] = [
  {
    local: "Publications/POLYNESIAN ART.jpeg",
    key: "publications/polynesia/cover.jpeg",
    mime: "image/jpeg",
    alt: "Polynesia — cover",
    link: { model: "publication", id: "polynesia", field: "coverImageId" },
  },
  {
    local: "Publications/Sepik Ramu Art.jpeg",
    key: "publications/sepik-ramu/cover.jpeg",
    mime: "image/jpeg",
    alt: "Sepik · Ramu — cover",
    link: { model: "publication", id: "sepik-ramu", field: "coverImageId" },
  },
  {
    local: "Publications/ART OF THE POLYNESIAN OUTLIERS-3.pdf",
    key: "publications/polynesian-outliers/book.pdf",
    mime: "application/pdf",
    alt: "Art of the Polynesian Outliers — book (PDF)",
    link: { model: "publication", id: "polynesian-outliers", field: "pdfId" },
  },
  {
    local: "Publications/Rolin book-low res.pdf",
    key: "publications/baron-rolin/book.pdf",
    mime: "application/pdf",
    alt: "Baron Freddy Rolin — book (PDF)",
    link: { model: "publication", id: "baron-rolin", field: "pdfId" },
  },
  {
    local: "Press/Special-Conru-online-insert-web.pdf",
    key: "press/conru-online-insert.pdf",
    mime: "application/pdf",
    alt: "Special Conru Online insert (PDF)",
    link: { model: "press", id: "press-conru-online", field: "fileId" },
  },
];

/** Upload to GCS if the object is missing, then upsert the Media row. Returns id. */
async function ensureMedia(localPath: string, key: string, mime: string, alt: string | null) {
  const buf = readFileSync(localPath);
  const bytes = statSync(localPath).size;
  const file = bucket.file(key);
  const [exists] = await file.exists();
  if (!exists) {
    await file.save(buf, { contentType: mime, resumable: false });
    console.log(`  ↑ uploaded ${key} (${(bytes / 1024).toFixed(0)} KB)`);
  } else {
    console.log(`  = exists   ${key}`);
  }
  const media = await db.media.upsert({
    where: { key },
    update: { url: publicUrl(key), mimeType: mime, bytes, alt },
    create: { key, url: publicUrl(key), mimeType: mime, bytes, alt },
  });
  return media.id;
}

const slugifyName = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

async function main() {
  // 1) Mapped covers / PDFs / press file --------------------------------
  console.log("→ Mapped assets");
  for (const a of ASSETS) {
    const localPath = join(ROOT, a.local);
    try {
      statSync(localPath);
    } catch {
      console.warn(`  ! missing on disk, skipping: ${a.local}`);
      continue;
    }
    const mediaId = await ensureMedia(localPath, a.key, a.mime, a.alt);
    if (a.link.model === "publication") {
      await db.publication.update({ where: { id: a.link.id }, data: { [a.link.field]: mediaId } });
    } else {
      await db.pressItem.update({ where: { id: a.link.id }, data: { [a.link.field]: mediaId } });
    }
    console.log(`  → linked ${a.link.model}/${a.link.id}.${a.link.field}`);
  }

  // 2) Gallery images → media library (unassigned) ----------------------
  const imagesDir = join(ROOT, "Images");
  let galleryCount = 0;
  try {
    statSync(imagesDir);
    console.log("→ Gallery images (media library)");
    for (const localPath of listFilesRecursive(imagesDir)) {
      if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(localPath)) continue;
      const rel = relative(imagesDir, localPath);
      const key = `media/gallery/${slugifyName(rel)}`;
      const mime = /\.png$/i.test(localPath) ? "image/png" : "image/jpeg";
      await ensureMedia(localPath, key, mime, null);
      galleryCount++;
    }
  } catch {
    console.warn("  ! no Images/ folder, skipping gallery");
  }

  console.log(`\n✅ Done. Mapped ${ASSETS.length} assets, ${galleryCount} gallery images in the library.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error("❌ Import failed:", err);
    await db.$disconnect();
    process.exit(1);
  });
