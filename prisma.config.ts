// Prisma CLI config (migrate / introspect / seed).
// Runtime queries use the Neon driver adapter in src/lib/db.ts, not this URL.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // TS seed runner (tsx) — the generated Prisma client uses extensionless
    // ESM imports that bare `node` can't resolve, so esbuild-backed tsx is used.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations run over the pooled DATABASE_URL by default (modern Neon has no
    // separate direct URL). DIRECT_URL is an optional override for setups that
    // still expose an unpooled endpoint and want migrations to bypass the pooler.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
