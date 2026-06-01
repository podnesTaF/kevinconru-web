---
name: build-state
description: Roadmap status + key implementation decisions for the kevinconru-web build
metadata:
  type: project
---

The site is built across all 5 planning roadmap steps (planning/overview.md §7): foundations, backend core, public site, admin CMS, polish. `npm run build` + `npm run lint` are green.

Key decisions (non-obvious, not all in planning docs):
- **Tailwind v3** (not v4) — config-based; tokens map to palette CSS vars in `globals.css`.
- **Admin forms** use native `useActionState` + `FormData` + server-side zod (NOT react-hook-form, despite the plan) — simpler with Server Actions. TipTap/media values flow via hidden inputs.
- Client-safe action state lives in `lib/actions/types.ts` (importing it from the server-only `_shared.ts` pulls Prisma/auth into the browser bundle — keep them split).
- Admin is under route group `(admin)/admin/(authed)/` so `/admin/login` stays outside the auth guard.
- Prisma 7 client generated to `src/generated/prisma` (gitignored, no barrel `index` — import from `/client`); seeds run via **tsx**.
- **`unstable_instant` deliberately NOT adopted** — it requires enabling Cache Components + `use cache` + Suspense refactor (draft API); public pages are already static/SSG so prefetch covers nav.

Not done (need a real environment): Lighthouse audit, deploy, live GCS upload test. See [[env-db-state]].
