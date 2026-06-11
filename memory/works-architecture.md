---
name: works-architecture
description: Config-driven "work" entities (Publications, Press, Exhibitions)
metadata:
  type: project
---

Publications, Press and Exhibitions are three separate Prisma models that share a config-driven layer so a 4th entity is cheap to add. See [[db-and-migrations]] for applying the schema.

- `src/lib/works/config.ts` — `WORKS` registry (one `WorkConfig` per kind: paths, labels, gallery owner field, metaField outlet/venue, hasFeatured). Client-safe; nav + sitemap + forms read it.
- `src/lib/works/actions.ts` — `makeWorkActions({config, model, schema, readForm})` factory returns create/update/remove/setPublished/setFeatured/reorder. NOT a `"use server"` file. Each entity's `src/lib/actions/<entity>.ts` is `"use server"`, calls the factory and re-exports the results as named `async function` wrappers (keeps stable action names; Next requires async-function exports).
- Queries are NOT factored (would erase Prisma return types) — thin per-entity files in `src/lib/queries/` calling `db.<model>` directly.
- `GalleryImage` is polymorphic across all three via nullable FKs (`publicationId`/`pressItemId`/`exhibitionId`); shared `src/lib/actions/gallery.ts` + `GalleryManager`.
- Admin: one `WorkForm` (variant `publication|press|exhibition`) + `workAdminRows` helper for the list pages.
- Public: Press + Exhibitions share `WorkIndex`/`WorkCard`/`WorkDetail` (image-cover layout, view-model mapped per route). Publications keep their bespoke `PubCover`/facts/OG-image view.
- Region was removed from Publications entirely (model, filter UI, helpers) on 2026-06-11.
