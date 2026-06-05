# Format → kevinconru-web content import plan

Status: **EXECUTED 2026-06-04** via `scripts/generate-format-manifest.py` (manifest) +
`npm run import:format` (idempotent importer). Decisions taken (delegated): `SoutheastAsia`
added to the Region enum; Bernatzik years 2003/2004/2005 + interview years 2005 (Tribalmania) /
2020 (TAS) are best-effort — **verify in admin**; `southern-african` retitled "The Art of Southeast
Africa"; dealer catalogues use kind `ExhibitionCatalogue`; skipped as unavailable: TAM summer 2014,
empty drafts, footer address, Vasco & Co. Result: 22 publications / 13 press / 144 gallery images.

Sources verified on 2026-06-04:

- **Old site** (Format): all 37 pages crawled from `https://www.kevinconru.com/` (sitemap.xml). Pages are
  caption-rich image galleries + a few long-form interview texts. Nav: ABOUT · PUBLICATIONS · VIDEO ·
  PRESS · LINKS · Around the Coral Sea.
- **Local export** `media/` (29 folders, 175 jpg/jpeg, no PDFs) — the originals downloaded from Format.
  Folder names match old-site slugs. Some folders have fewer files than the page shows
  (e.g. `conru-1995`: 5 of 7) → importer must fall back to fetching missing originals from the
  still-live `format.creatorcdn.com` URLs.
- **Current DB**: 10 publications (incl. 1 test row), 5 press (incl. 1 test row), 3 films.
  Schema as of migration `20260603_content_blocks_gallery_press`:
  `Publication{body, coverImage, pdf, externalUrl, gallery[]}` ·
  `PressItem{slug, outlet, title, subtitle, year, body, coverImage, pdf, externalUrl, gallery[]}` ·
  `GalleryImage{media, title, caption, sortOrder}` (polymorphic pub/press).

## Field-mapping rules (applies to every item)

| Old-site element | New field |
|---|---|
| Index-card cover image | `coverImage` (Media, GCS key `publications/<slug>/cover.jpg` / `press/<slug>/cover.jpg`) |
| Gallery image | `GalleryImage.media` (key `publications/<slug>/gallery/NN-<name>.jpg`), DOM order → `sortOrder` |
| Caption first line (object name, e.g. "Uli Figure") | `GalleryImage.title` |
| Caption remainder (provenance / dims / references) | `GalleryImage.caption` |
| Page essay / interview text (where present) | `body` (paragraphs reconstructed from `<p>` boundaries in the crawled HTML, passed through `sanitizeHtml`) |
| "Buy this book" link target (none found live — all dead/`#`) | `externalUrl` (leave null unless Kevin supplies links) |
| Caption ↔ image pairing | by normalized filename (local `Numériser 41.jpg` ↔ CDN `Numériser+41.jpg`), fallback to DOM order; manifest is human-reviewed before insert |

---

## A. Publications (old-site order = new `sortOrder`)

| # | Old page | → action | slug | year | kind / region | cover | gallery | body | notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | W. O. Oldman *The Remarkable Collector* | **enrich existing** | `william-oldman` | 2016 | Archive / Oceania | `media/publications-oldman` → `OLDMAN-cover.jpg` (in `publications-covers`) | 7 spreads (`Oldman-K*.jpg`), no captions | keep current body | |
| 2 | Masterpieces: New Guinea Art from the RMCA (`publicationstervuren`) | **create** | `masterpieces-rmca` | 2014 | ExhibitionCatalogue / Oceania | `catalogue-jaquette.jpg` | 4 (`media/masterpieces/tervuren*.jpg`), no captions | short blurb (Brussels 2014 exhibition, Royal Museum for Central Africa) — already referenced in chronology | publisher: RMCA/Tervuren |
| 3 | Bismarck Archipelago Art | **enrich existing** | `bismarck` | 2013 | Monograph / Melanesia | `cover+UK.jpg` (`media/bismarck-archipelago-art`) — replaces seed placeholder | 6 captioned plates (Uli figure, Matua mask, Tatanua…) — captions carry collector/provenance/materials/dims → title+caption | keep current body | replaces the 2 seed-demo gallery images |
| 4 | Bernatzik Africa | **create** | `bernatzik-africa` | **ASK** (≈2003?) | Archive / Africa | `Numériser 41.jpg` | 6 archival photos w/ scholarly captions (`media/bernatzik-afrika`) | 1.3k-ch captions only; body = short intro **ASK Kevin for blurb** or write 1-liner | Hugo Bernatzik photographs |
| 5 | Bernatzik South Pacific | **create** | `bernatzik-south-pacific` | **ASK** | Archive / Oceania | `Numériser 49.jpg` | 6 photos w/ captions (`media/bernatzik-south-pacific`) | same | |
| 6 | Bernatzik Southeast Asia | **create** | `bernatzik-southeast-asia` | **ASK** | Archive / **⚠ no fitting Region enum value** | `Numériser 55.jpg` | 6 photos w/ captions (`media/bernatzik-southeast-asia`) | same | **Decision: add `SoutheastAsia` to the Region enum** (small migration + label; region filter pills unaffected) |
| 7 | Solomon Islands Art | **create** | `solomon-islands-art` | 2008 | Monograph / Melanesia | `Numériser 69.jpg` | 9 captioned plates (`media/solomon-islands-art`) — rich provenance captions | short blurb **ASK** | |
| 8 | The Art of Southeast Africa | **enrich existing** | `southern-african` | 2002 | Monograph / Africa | `Numériser 63.jpg1.jpg` | 5 plates (staff finials, neckrest, pipe) w/ short captions (`media/the-art-of-southeast-afrika`) | keep current body | **Decision: retitle existing row to "The Art of Southeast Africa"?** (seed title is "Southern African Art") |
| 9 | Guinea Art in Chicago (A. B. Lewis) | **enrich existing** | `ab-lewis` | 2025 | Archive / Oceania | `Numériser 46.jpg` | 5 spreads (`media/publications-guinea-art-in-chicago`) | **replace body with the 5.8k-ch essay** from the old page (the Melanesia/Field Museum text) — paragraphs preserved, sanitized | confirmed same book ("28 photographs by Ronald Clyne of the 1921 A. B. Lewis installation…, Field Museum Chicago") |
| 10 | South Seas — Art of the Pacific 2008 (`conru-mer-du-sud-2008`) | **create** | `south-seas-2008` | 2008 | ExhibitionCatalogue / Oceania | `Numériser 42.jpeg` | 5 captioned plates (`media/conru-mer-du-sud-2008`) **+ 3 more from `/catalogs` page** ("published objects" — same book) → one merged gallery | captions only; 1-line body | the old `/catalogs` page folds in here |
| 11 | Rarities — Art from the Pacific Islands 2007 (`publication-rarities`) | **create** | `rarities-2007` | 2007 | ExhibitionCatalogue / Oceania | `Numériser 36.jpg` | 6 captioned plates (Maori figure & cloak, New Ireland mask, Tami object…) (`media/publications-rarities`) | 1-line body | |
| 12 | Oceanic Shields 2006 | **create** | `oceanic-shields-2006` | 2006 | ExhibitionCatalogue / Oceania | `Numériser 31.jpg` | 6 captioned shields (`media/conru-oceanic-shields`) | 1-line body | |
| 13 | Southeast African and Oceanic Art 2005 | **create** | `catalogue-2005` | 2005 | ExhibitionCatalogue / AfricaAndOceania | `Numériser 26.jpg` | 6 captioned (`media/conru-2005`) | 1-line body | |
| 14 | Catalogue 2004 | **create** | `catalogue-2004` | 2004 | ExhibitionCatalogue / AfricaAndOceania | `Numériser 20.jpg` | 5 captioned (`media/publications-conru-2004` + `media/conru-2004`?) | 1-line body | Luba, Kwele, Sepik, Tshokwe |
| 15 | Catalogue 2002 | **create** | `catalogue-2002` | 2002 | ExhibitionCatalogue / AfricaAndOceania | `Numériser 15.jpg` | 6 captioned (`media/conru-2002`) | 1-line body | Tabwa/Kota/Kongo/Epa (mostly Africa) |
| 16 | The Colour of Melanesia 1999 | **create** | `colour-of-melanesia-1999` | 1999 | ExhibitionCatalogue / Melanesia | `Numériser 10.jpg` | 5 captioned (`media/conru-1999`) | 1-line body | |
| 17 | Catalogue 1995 | **create** | `catalogue-1995` | 1995 | ExhibitionCatalogue / AfricaAndOceania | `Numériser.jpg` | 6 captioned (`media/conru-1995`, 2 files missing locally → fetch from CDN) | 1-line body | |

**Untouched existing publications** (newer than the old site; already correct): `ernst-heinrich`,
`polynesia` (2023), `polynesian-outliers` (pdf ✓), `baron-rolin` (pdf ✓), `sepik-ramu` (cover+gallery ✓).
⚠ `polynesia`'s GCS cover link was lost in the Jun-3 migration — **re-link** `publications/polynesia/cover.jpeg`
(already in GCS). **Delete** `test-publication`.

`media/publications-covers` (17 files) = the index-card covers listed above; `media/conru-arts-and-antiques`
belongs to press #6.

---

## B. Press (old-site order; new rows get covers from `media/press-covers`)

| # | Old page | → action | slug | outlet · subtitle (citation) | year | content strategy |
|---|---|---|---|---|---|---|
| 1 | Fragments of the Fang (`untitled-gallery`) | **create** | `fragments-of-the-fang` | Art & Antiques Magazine · "October 2007" | 2007 | cover `Panorama0.jpg`; gallery = 5 wide panorama scans (`media/press-fragments-of-the-fangs`, 48 MB — importer should downscale to ≤2400px for web) |
| 2 | NACF (`simple-page`) | **create** | `nacf-1988` | NACF Magazine · "Christmas 1988" — title "Towards 1992: Analysis of Export for Cultural Heritage Objects…" | 1988 | cover `NACF_cover.jpg`; gallery = 9 scans (`media/nacf`). ⚠ index text also contains stray "TRIBUS" — confirm it's part of this card |
| 3 | TAM 94 issue 3 | **create** | `tam-1994-issue-3` | Tribal Arts Magazine · "September 1994, Issue 3" — "Treasures of the Museum für Völkerkunde" | 1994 | cover `TAM1994_cover.jpg`; gallery = 3 scans (`media/press-tam94-ussue3`) |
| 4 | TAM 94 issue 4 | **create** | `tam-1994-issue-4` | Tribal Arts Magazine · "Winter 1994–95, Issue 4" — "The Royal Albert Memorial Museum Exeter and an Important Hawaiian Spear Support" | 1994 | cover `TAM_94_00.jpg`; gallery = 3 scans (`media/press-tam94-issue4`) |
| 5 | TAM 99 | **create** | `tam-1999` | Tribal Arts Magazine · "Spring 1999" — "Thoughts over an Attribution" | 1999 | cover `TAM1999_cover.jpg`; gallery = 4 scans (`media/press-tam-99`) |
| 6 | Passionate Journey (`284527-press-conru-arts-and-antiques`) | **create** | `passionate-journey-2009` | Art & Antiques · "Apr 2009, Vol. 32 Issue 4, p. 80" | 2009 | **body = full 6.1k-ch article text** (real text on page, paragraphs preserved) + gallery = 7 scans (`media/conru-arts-and-antiques` + covers) |
| 7 | Tribalmania interview | **create** | `tribalmania-interview` | Tribalmania Gallery · "Interview" | **ASK** (≈2005, Santa Fe) | **body = full 14.6k-ch interview** + 2 photos (`media/press-conru-tribalmania`, cover `Conru_Tribalmnia_modifié-11.jpg`) |
| 8 | Tribal Art Society interview (`pres-conru-tas`) | **create** | `tribal-art-society-interview` | Tribal Art Society · "Conversation with Alex Arthur and Joaquin Pecci" | **ASK** | **body = full 9.9k-ch interview** + gallery = 10 photos (`media/pres-conru-tas`, cover `TAS.jpg`) |
| 9 | Tribal Art Magazine autumn 2013 | **create** | `tam-autumn-2013` | Tribal Art Magazine · "Autumn 2013" | 2013 | cover `Numériser 148.jpeg`; gallery = ~19 scans (`media/press-tribal-art-magazine-autumn-2013`) — the Bismarck/Ring-of-Fire feature |
| 10 | "Tribal Art Magazine summer 2014" (index mention, no page/card) | **ASK** | — | — | 2014 | listed on the old press index but has no live page (the empty `665021-25 simple-page` drafts) — does Kevin have the scans? |

**Existing press rows kept**: `press-conru-online` (2025, PDF ✓), `press-artonov` (2024), `press-lempertz`
(2023), `press-wereldmuseum` (2013) — optionally enrich with covers later. **Delete** the test row
(`cmpwkc8lm…`, "Nice press").

---

## C. Other old-site pages (no import work)

- **VIDEO** — only the Oldman film; new site already has all 3 films with the corrected intro. ✓ done
- **ABOUT** — old text is an *older* version of the current bio. Keep current. Optional: old page lists the
  gallery address "48 rue des Minimes, Sablon, 1000 Brussels" — add to contact/footer? **ASK**
- **LINKS** — PAA + OAS already exist as affiliations; old page also lists *"Friends: Vasco & Co Books"*
  → optional new Affiliation (role "Friend"). **ASK**
- **Around the Coral Sea** — Kevin's instruction list says delete; not present in the new site. ✓
- 5 × `simple-page` drafts (`665021–665025`) — empty, ignore.

---

## D. Mechanics (phase 2, after approval)

1. **Manifest generation** (`scripts/format-manifest.ts`, checked in): I generate it from the crawled
   pages — per item: fields above + `gallery: [{file, title, caption}]` + body HTML. **Human-reviewable
   before any insert** (this is the proofreading gate for caption pairing).
2. **Importer** (`scripts/import-format.ts`, same pattern as `import-wetransfer.ts`): idempotent —
   GCS upload (skip existing keys, prefer local `media/` file, else fetch original from
   `format.creatorcdn.com`), `Media` upsert by key, publication/press upsert by slug, gallery rebuilt
   per slug (delete + recreate keeps re-runs clean), bodies through `sanitizeHtml`.
3. **Image hygiene**: downscale panoramas/scans > 2400 px (`sharp`), capture width/height into Media.
4. **Cleanup**: delete `test-publication` + test press row.
5. **Order**: publications sorted as table A (old-site order ≈ reverse-chronological), new press after the
   4 existing rows in table-B order.
6. Rebuild/redeploy afterwards (static pages) — the importer writes straight to the DB.

## Decisions needed from you (Kevin / Jelle)

1. **Region enum**: add `SoutheastAsia` for Bernatzik Southeast Asia? (recommended)
2. **Years**: Bernatzik Africa / South Pacific / Southeast Asia; Tribalmania interview; TAS interview.
3. **Retitle** `southern-african` → "The Art of Southeast Africa"?
4. Dealer catalogues as `ExhibitionCatalogue` (current enum) — OK, or add a `Catalogue` kind?
5. TAM summer 2014 — scans available?
6. Old gallery address in the footer/contact?
7. "Vasco & Co Books" friend link on the About/affiliations?
