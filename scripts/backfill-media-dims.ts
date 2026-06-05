// One-off: fill Media.width/height for image rows that predate the sharp
// pipeline (seed assets + early wetransfer uploads). GCS keys are downloaded;
// seed/* keys are read from public/. Idempotent — only touches null dims.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";
import sharp from "sharp";
import { Storage } from "@google-cloud/storage";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
dotenv.config({ path: ".env.local" }); dotenv.config();

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }) });
const storage = new Storage({ projectId: process.env.GCS_PROJECT_ID, credentials: { client_email: process.env.GCS_CLIENT_EMAIL, private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n") } });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

async function main() {
  const rows = await db.media.findMany({ where: { width: null, mimeType: { startsWith: "image/" } }, select: { id: true, key: true } });
  let ok = 0, fail = 0;
  for (const r of rows) {
    try {
      const buf = r.key.startsWith("seed/")
        ? readFileSync(join(import.meta.dirname, "..", "public", r.key))
        : (await bucket.file(r.key).download())[0];
      const m = await sharp(buf, { failOn: "none" }).rotate().metadata();
      if (m.width && m.height) {
        await db.media.update({ where: { id: r.id }, data: { width: m.width, height: m.height } });
        ok++;
      } else fail++;
    } catch (e) { console.warn("  !", r.key, (e as Error).message); fail++; }
  }
  console.log(`✔ backfilled ${ok}/${rows.length} (${fail} failed)`);
}
main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
