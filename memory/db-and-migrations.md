---
name: db-and-migrations
description: Neon DB setup + how to run Prisma migrations for this project
metadata:
  type: project
---

The app uses a **single shared Neon Postgres database** (`neondb`, runtime `DATABASE_URL`) for both local dev and production — there is no separate dev DB. So any `prisma migrate` runs against live data; treat destructive migrations with care and confirm with the user before dropping columns/data.

Operational gotchas:
- `prisma migrate dev` fails here: the environment is non-interactive, so its data-loss confirmation prompt aborts. Hand-author the migration SQL under `prisma/migrations/<timestamp>_<name>/migration.sql` instead (match the format of existing migrations), then apply with `prisma migrate deploy`.
- `prisma migrate deploy` over the Neon **pooled** endpoint (`-pooler`) times out on the advisory lock (`P1002`, PgBouncer). Run it with `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` set.
- `npx prisma generate` produces types from `schema.prisma` (no DB needed), so `tsc`/build verify without applying migrations — but `next build` prerenders the public index pages, which DO query the DB, so new tables must be applied before a full build passes.
- If `next build` fails with "Cannot resolve 'sanitize-html'", node_modules is out of sync with package.json — run `npm install`.
