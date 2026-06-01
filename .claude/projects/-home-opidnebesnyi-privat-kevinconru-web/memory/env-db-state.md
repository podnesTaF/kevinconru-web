---
name: env-db-state
description: Local .env has a real DATABASE_URL but a placeholder DIRECT_URL — affects Prisma migrations
metadata:
  type: project
---

In `.env` (as of 2026-06-01), `DATABASE_URL` is a real Neon **pooled** connection, but `DIRECT_URL` is still the template placeholder (`HOST.REGION.aws.neon.tech`).

**Why it matters:** `prisma.config.ts` points migrations at `DIRECT_URL ?? DATABASE_URL`, so `prisma migrate dev` / `migrate deploy` fail with P1001 until a real direct URL is set.

**How to apply:** Either set `DIRECT_URL` to the Neon **direct** (non-pooler) string, or run migrations over the pooled URL as a workaround:
`DIRECT_URL="$(grep -E '^DATABASE_URL=' .env | cut -d= -f2- | tr -d '"')" npm run db:migrate` (then `npm run db:seed`). The init migration was applied this way and the DB is seeded.
