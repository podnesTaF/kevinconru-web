---
name: env-db-state
description: Neon setup uses a single pooled DATABASE_URL for both runtime and migrations; DIRECT_URL is optional
metadata:
  type: project
---

`.env` has a real Neon **pooled** `DATABASE_URL` (host contains `-pooler`). It is used for **both** runtime queries (via the Neon driver adapter in `src/lib/db.ts`) **and** migrations/seed.

**DIRECT_URL is optional and unset** (as of 2026-06-01). Modern Neon no longer exposes a separate direct/unpooled connection string, so the project runs `prisma migrate deploy` and `prisma db seed` over the pooled URL. `prisma.config.ts` and `prisma/seed.ts` use `DIRECT_URL ?? DATABASE_URL`, so leaving `DIRECT_URL` unset just falls back to the pooled URL.

**Verified:** `npx prisma migrate status` connects over the pooler host and reports "Database schema is up to date!" The init migration is applied and the DB is seeded.

**Pitfall (resolved):** earlier `.env` held a *non-empty placeholder* `DIRECT_URL` (`HOST.REGION.aws.neon.tech`), which defeated the `?? DATABASE_URL` fallback and caused P1001. That line was removed — don't re-add a placeholder; either leave `DIRECT_URL` unset or give it a real unpooled endpoint.
