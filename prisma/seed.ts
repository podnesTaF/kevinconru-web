// Idempotent seed — admin user + full prototype content (publications, plates,
// films, press, chronology, affiliations, site settings). Transcribed from
// planning/design-reference/{data.jsx,pages2.jsx} + requirements.txt.
//
// Run: `npm run db:seed` (uses tsx via prisma.config.ts). Safe to re-run.
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

// Standalone script: load .env.local first (priority), then .env as fallback.
dotenv.config({ path: ".env.local" });
dotenv.config();

// Pooled DATABASE_URL by default; DIRECT_URL is an optional unpooled override.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set to seed the database.");
}

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dirname, "..", "public", "seed");

// ─────────────────────────── Mappings ───────────────────────────
const REGION = {
  Oceania: "Oceania",
  Polynesia: "Polynesia",
  Melanesia: "Melanesia",
  Africa: "Africa",
  "Africa & Oceania": "AfricaAndOceania",
} as const;

const KIND = {
  Archive: "Archive",
  Monograph: "Monograph",
  "Exhibition catalogue": "ExhibitionCatalogue",
} as const;

// ─────────────────────────── Seed media ───────────────────────────
// First run points `url` at the bundled /seed assets; migrate to GCS later.
const SEED_ASSETS = [
  { file: "logo-short.png", alt: "Kevin Conru — logo", mimeType: "image/png" },
  { file: "logo.jpg", alt: "Kevin Conru — logo (full)", mimeType: "image/jpeg" },
  { file: "portrait.jpg", alt: "Portrait of Kevin Conru", mimeType: "image/jpeg" },
  { file: "object-mask.jpg", alt: "Mask, Lower Sepik, New Guinea", mimeType: "image/jpeg" },
  { file: "object-headdress.jpg", alt: "Headdress, Ramu River, New Guinea", mimeType: "image/jpeg" },
] as const;

const keyForAsset = (assetPath: string) => `seed/${assetPath.split("/").pop()}`;

// ─────────────────────────── Publications ───────────────────────────
const PUBLICATIONS = [
  {
    id: "ab-lewis",
    title: "A. B. Lewis",
    sub: "Personal photographs of New Guinea",
    year: 2025,
    pages: 240,
    publisher: "Conru Editions",
    region: "Oceania",
    type: "Archive",
    coverBg: "linear-gradient(170deg, #2c2826 0%, #16151a 100%)",
    coverFg: "#efe9d8",
    summary:
      "A. B. Lewis's own field photographs of New Guinea artefacts, assembled and annotated for the first time — a quiet, foundational record of early twentieth-century Melanesian material culture.",
  },
  {
    id: "ernst-heinrich",
    title: "The Ernst Heinrich Archive",
    sub: "A German collector's eye",
    year: 2025,
    pages: 288,
    publisher: "Conru Editions",
    region: "Oceania",
    type: "Archive",
    coverBg: "linear-gradient(165deg, #6e6552 0%, #2a261d 100%)",
    coverFg: "#efe9d8",
    summary:
      "The complete archive of the German collector Ernst Heinrich, published with full provenance and historical apparatus.",
  },
  {
    id: "polynesia",
    title: "Polynesia",
    sub: "Arts of the central Pacific",
    year: 2023,
    pages: 256,
    publisher: "Lempertz, Brussels",
    region: "Polynesia",
    type: "Exhibition catalogue",
    coverBg: "linear-gradient(180deg, #2a4858 0%, #0f1f28 100%)",
    coverFg: "#e8e2d2",
    summary:
      "Curated by Kevin Conru and published to accompany the related exhibition at Lempertz Brussels, this volume surveys the sculptural arts of Polynesia.",
  },
  {
    id: "polynesian-outliers",
    title: "Art of the Polynesian Outliers",
    sub: "The atolls beyond the triangle",
    year: 2023,
    pages: 196,
    publisher: "Conru Editions",
    region: "Polynesia",
    type: "Monograph",
    coverBg: "linear-gradient(170deg, #1a3d3a 0%, #08201e 100%)",
    coverFg: "#e0d6b9",
    summary:
      "A focused study of the Polynesian Outliers — the small, culturally Polynesian communities scattered through Melanesia and Micronesia, and the distinctive objects they produced.",
  },
  {
    id: "baron-rolin",
    title: "Baron Freddy Rolin",
    sub: "Archive of a Belgian collector & dealer",
    year: 2021,
    pages: 320,
    publisher: "Conru Editions",
    region: "Africa & Oceania",
    type: "Archive",
    coverBg: "linear-gradient(170deg, #b85a30 0%, #6a2814 100%)",
    coverFg: "#f6efe0",
    summary:
      "The archive of the Belgian collector and dealer Baron Freddy Rolin — correspondence, photographs and object records spanning a lifetime in tribal art.",
  },
  {
    id: "sepik-ramu",
    title: "Sepik · Ramu",
    sub: "Arts of the great rivers of New Guinea",
    year: 2019,
    pages: 272,
    publisher: "Lempertz, Brussels",
    region: "Oceania",
    type: "Exhibition catalogue",
    coverBg: "linear-gradient(180deg, #b3b89f 0%, #6e7556 100%)",
    coverFg: "#1a1814",
    coverImage: "assets/object-headdress.jpg",
    summary:
      "Curated by Kevin Conru and published alongside the exhibition at Lempertz Brussels, this catalogue gathers carved ancestors and ceremonial objects from the Sepik and Ramu river systems.",
    plates: [
      {
        id: "p1",
        title: "Headdress",
        region: "Ramu River, New Guinea",
        date: "c. 1900",
        materials: "Wood, pigment, fibre, feathers",
        dims: "62 × 38 × 30 cm",
        provenance: "Private collection, Brussels.",
        image: "assets/object-headdress.jpg",
        caption:
          "A composite ceremonial headdress incorporating multiple zoomorphic registers — a rare survival of full plumage.",
      },
      {
        id: "p2",
        title: "Mask",
        region: "Lower Sepik, New Guinea",
        date: "c. 1890",
        materials: "Wood, pigments, fibre, shell",
        dims: "44 × 22 × 18 cm",
        provenance: "Pierre Loeb, Paris; private collection.",
        image: "assets/object-mask.jpg",
        caption: "Carved from a single block and polychromed with lime, ochre and charcoal pigment.",
      },
    ],
  },
  {
    id: "william-oldman",
    title: "The William Oldman Collection",
    sub: "With Robert Hales",
    year: 2016,
    pages: 360,
    publisher: "Conru Editions",
    region: "Oceania",
    type: "Archive",
    coverBg: "linear-gradient(165deg, #3a2418 0%, #1a0e08 100%)",
    coverFg: "#efe9d8",
    summary:
      "Published with Robert Hales: a comprehensive study of the archive of William Oldman, one of the most significant dealers in Oceanic and ethnographic art of the twentieth century.",
  },
  {
    id: "bismarck",
    title: "Art of the Bismarck Archipelago",
    sub: "Ring of Fire",
    year: 2013,
    pages: 384,
    publisher: "Conru Editions",
    region: "Melanesia",
    type: "Monograph",
    coverBg: "linear-gradient(170deg, #c79a5a 0%, #6a4a22 100%)",
    coverFg: "#1a1814",
    coverImage: "assets/object-mask.jpg",
    summary:
      "A major survey of the art of the Bismarck Archipelago in Melanesia, released in September 2013. The book formed the basis of the Rotterdam Wereldmuseum's Ring of Fire exhibition, 2013–2014.",
    plates: [
      {
        id: "p1",
        title: "Tatanua Mask",
        region: "New Ireland, Papua New Guinea",
        date: "c. 1890",
        materials: "Wood, pigments, fibre, glass",
        dims: "44 × 22 × 18 cm",
        provenance: "Pierre Loeb, Paris; private collection, Brussels.",
        image: "assets/object-mask.jpg",
        caption:
          "Carved in a single block of softwood, polychromed with lime, ochre and charcoal pigment — attributable to the Lossuk River workshops.",
      },
      {
        id: "p2",
        title: "Malagan Helmet Mask",
        region: "Northern New Ireland",
        date: "c. 1900",
        materials: "Wood, paint, fibre, snail shell",
        dims: "62 × 38 × 30 cm",
        provenance: "Collected 1907; Linden-Museum Stuttgart; private collection.",
        image: "assets/object-headdress.jpg",
        caption:
          "An extraordinary composite Malagan figure incorporating fish, bird-snake and ancestor registers.",
      },
    ],
  },
  {
    id: "southern-african",
    title: "Southern African Art",
    sub: "Sculpture & the everyday object",
    year: 2002,
    pages: 224,
    publisher: "Conru Editions",
    region: "Africa",
    type: "Monograph",
    coverBg: "linear-gradient(170deg, #5a3a24 0%, #1a0e08 100%)",
    coverFg: "#efe9d8",
    summary:
      "An early and defining study of Southern African art — the headrests, staffs, vessels and figurative sculpture for which Kevin Conru first became known.",
  },
] as const;

const FILMS = [
  {
    id: "ontong-java",
    title: "Ontong Java — Encounters & Observations",
    year: 2023,
    youtube: "eq7e28pEuL4",
    start: 45,
    intro:
      "A short film made from early twentieth-century visual sources taken on Ontong Java Atoll, the majority of which are unknown.",
  },
  {
    id: "surrealism",
    title: "Oceanic Art & 100 Years of Surrealism",
    year: 2024,
    youtube: "YsdygtWSkxk",
    start: null,
    intro:
      "Curated by Kevin Conru, this exhibition — commemorating 100 years of Surrealism as an international artistic movement — presents artworks from the Pacific Islands (New Guinea, New Britain, Vanuatu and Easter Island) which greatly influenced the artists of the time and which continue to stimulate the imagination today.",
  },
  {
    id: "oldman-film",
    title: "The Oldman Collection — Maori Art in London",
    year: 2006,
    youtube: null,
    start: null,
    intro: "An early film documenting the William Oldman collection of Maori art in London.",
  },
] as const;

const PRESS = [
  { id: "press-conru-online", outlet: "Conru Online", year: 2025, title: "Special Conru Online insert" },
  { id: "press-artonov", outlet: "ARTONOV Festival", year: 2024, title: "100 Years of Surrealism — Oceanic Art" },
  { id: "press-lempertz", outlet: "Lempertz", year: 2023, title: "Polynesia — exhibition feature" },
  { id: "press-wereldmuseum", outlet: "Wereldmuseum Rotterdam", year: 2013, title: "Ring of Fire" },
] as const;

const TIMELINE = [
  { yr: "2025", ev: "The Ernst Heinrich Archive", desc: "Published the archive of the German collector; a study of A. B. Lewis's personal photographs of New Guinea artefacts." },
  { yr: "2024", ev: "100 Years of Surrealism", desc: "Curated an Oceanic art exhibition for the ARTONOV festival, Brussels." },
  { yr: "2023", ev: "Polynesia · Ontong Java", desc: "Curated and published on the arts of Polynesia (Lempertz Brussels); released the film “Ontong Java, Encounters and Observations”." },
  { yr: "2021", ev: "Baron Freddy Rolin", desc: "Published the archive of the Belgian collector and dealer." },
  { yr: "2019", ev: "Sepik / Ramu", desc: "Curated and published on the arts of the Sepik / Ramu area of Papua New Guinea (Lempertz Brussels)." },
  { yr: "2016", ev: "The William Oldman Collection", desc: "Comprehensive book on the Oldman archive, with Robert Hales." },
  { yr: "2014", ev: "Papua New Guinea Masterpieces", desc: "Curated an exhibition from the Royal Museum for Central Africa, held in Brussels." },
  { yr: "2013", ev: "Ring of Fire", desc: "Major book on the art of the Bismarck Archipelago; basis of the Wereldmuseum Rotterdam exhibition, 2013–2014." },
  { yr: "2006", ev: "The Oldman Collection — Maori Art in London", desc: "Produced a short documentary film." },
] as const;

const AFFILIATIONS = [
  { role: "Member", name: "Pacific Arts Association", url: null },
  { role: "Member", name: "Oceanic Art Society", url: null },
  { role: "Advisor", name: "Wyvern Research Institute, London", url: "https://wyvernresearch.org/" },
  { role: "MA", name: "Arts Policy, The City University, London", url: null },
] as const;

const BIO_HTML = [
  "<p>Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. He has travelled extensively in the Pacific and is a member of the Pacific Arts Association and the Oceanic Art Society. He has an Arts Policy MA from The City University, London, and is an orchestral double bassist.</p>",
  "<p>Kevin has published online the South Seas diary of a turn-of-the-20th-century Australian journalist, and has produced a major book on the art of the Bismarck Archipelago in Melanesia which was released in September 2013. This book formed the basis of the Rotterdam Wereldmuseum's Ring of Fire exhibition that took place in 2013–2014. He has curated an important exhibition of Papua New Guinea masterpieces from the Royal Museum for Central Africa, which was held in Brussels in 2014.</p>",
  "<p>Along with Robert Hales, he published a comprehensive book on the archive of William Oldman in 2016, and later in 2021, the archive of the Belgian collector and dealer Baron Freddy Rolin. He has curated and published on the arts of the Sepik / Ramu area of Papua New Guinea in 2019 and the arts of Polynesia in 2023. Both of these publications accompanied related exhibitions which were held at Lempertz Brussels. In 2024, he organised an Oceanic art exhibition that celebrated 100 years of Surrealism for the ARTONOV festival in Brussels. Recently, in 2025, he published the archive of the German collector Ernst Heinrich and a book on A. B. Lewis's personal photographs of New Guinea artefacts.</p>",
  "<p>Kevin Conru advises the Wyvern Research Institute in London. Beyond his curatorial and academic work, he produced two short films: <em>The Oldman Collection — Maori Art in London</em> (2006) and <em>Ontong Java, Encounters and Observations</em> (2023).</p>",
].join("\n");

async function main() {
  // 1) Admin user ----------------------------------------------------------
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user.");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN", name: "Kevin Conru" },
    create: { email: adminEmail, passwordHash, role: "ADMIN", name: "Kevin Conru" },
  });
  console.log(`✔ admin user (${adminEmail})`);

  // 2) Media ----------------------------------------------------------------
  const mediaByKey = new Map<string, string>(); // key → media id
  for (const asset of SEED_ASSETS) {
    const key = `seed/${asset.file}`;
    let bytes = 0;
    try {
      bytes = statSync(join(SEED_DIR, asset.file)).size;
    } catch {
      /* asset missing on disk — still record the row */
    }
    const media = await db.media.upsert({
      where: { key },
      update: { url: `/seed/${asset.file}`, mimeType: asset.mimeType, bytes, alt: asset.alt },
      create: { key, url: `/seed/${asset.file}`, mimeType: asset.mimeType, bytes, alt: asset.alt },
    });
    mediaByKey.set(key, media.id);
  }
  console.log(`✔ ${SEED_ASSETS.length} media assets`);

  // 3) Site settings (singleton) -------------------------------------------
  const settings = {
    bio: BIO_HTML,
    roleLine: "Dealer · Curator · Publisher · Double bassist",
    heroStats: [
      { num: "10", label: "Publications" },
      { num: "6", label: "Curated exhibitions" },
      { num: "2", label: "Short films" },
    ],
    marquee: [
      "Wereldmuseum Rotterdam",
      "Royal Museum for Central Africa",
      "Lempertz Brussels",
      "Pacific Arts Association",
      "Oceanic Art Society",
      "ARTONOV Festival",
      "Wyvern Research Institute",
    ],
    tel: "+32 478 566 459",
    telHref: "tel:+32478566459",
    email: "kevinconru@yahoo.com",
    facebook: "https://www.facebook.com/kevin.conru/",
    instagram: "https://www.instagram.com/kevinconru/",
    city: "Brussels, Belgium",
  };
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: settings,
    create: { id: "singleton", ...settings },
  });
  console.log("✔ site settings");

  // 4) Publications + plates ------------------------------------------------
  for (let i = 0; i < PUBLICATIONS.length; i++) {
    const p = PUBLICATIONS[i];
    const coverImageAsset = "coverImage" in p ? p.coverImage : undefined;
    const coverImageId = coverImageAsset
      ? mediaByKey.get(keyForAsset(coverImageAsset)) ?? null
      : null;
    const data = {
      slug: p.id,
      title: p.title,
      subtitle: p.sub,
      year: p.year,
      pages: p.pages,
      publisher: p.publisher,
      region: REGION[p.region],
      kind: KIND[p.type],
      summary: `<p>${p.summary}</p>`,
      coverBg: p.coverBg,
      coverFg: p.coverFg,
      coverImageId,
      featured: i < 3,
      published: true,
      sortOrder: i,
    };
    await db.publication.upsert({
      where: { slug: p.id },
      update: data,
      create: { id: p.id, ...data },
    });

    const plates = "plates" in p ? p.plates : [];
    for (let j = 0; j < plates.length; j++) {
      const pl = plates[j];
      const imageId = mediaByKey.get(keyForAsset(pl.image));
      if (!imageId) continue;
      const plateId = `${p.id}__${pl.id}`;
      const plateData = {
        publicationId: p.id,
        title: pl.title,
        region: pl.region,
        dateText: pl.date,
        materials: pl.materials,
        dimensions: pl.dims,
        provenance: pl.provenance,
        caption: pl.caption,
        imageId,
        sortOrder: j,
      };
      await db.plate.upsert({
        where: { id: plateId },
        update: plateData,
        create: { id: plateId, ...plateData },
      });
    }
  }
  console.log(`✔ ${PUBLICATIONS.length} publications (+ plates)`);

  // 5) Films ----------------------------------------------------------------
  for (let i = 0; i < FILMS.length; i++) {
    const f = FILMS[i];
    const data = {
      title: f.title,
      year: f.year,
      youtubeId: f.youtube,
      startSeconds: f.start,
      intro: `<p>${f.intro}</p>`,
      published: true,
      sortOrder: i,
    };
    await db.film.upsert({ where: { id: f.id }, update: data, create: { id: f.id, ...data } });
  }
  console.log(`✔ ${FILMS.length} films`);

  // 6) Press ----------------------------------------------------------------
  for (let i = 0; i < PRESS.length; i++) {
    const pr = PRESS[i];
    const data = { outlet: pr.outlet, year: pr.year, title: pr.title, published: true, sortOrder: i };
    await db.pressItem.upsert({ where: { id: pr.id }, update: data, create: { id: pr.id, ...data } });
  }
  console.log(`✔ ${PRESS.length} press items`);

  // 7) Chronology -----------------------------------------------------------
  for (let i = 0; i < TIMELINE.length; i++) {
    const t = TIMELINE[i];
    const id = `tl-${i}`;
    const data = { year: t.yr, event: t.ev, description: `<p>${t.desc}</p>`, sortOrder: i };
    await db.timelineEntry.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.log(`✔ ${TIMELINE.length} chronology entries`);

  // 8) Affiliations ---------------------------------------------------------
  for (let i = 0; i < AFFILIATIONS.length; i++) {
    const a = AFFILIATIONS[i];
    const id = `aff-${i}`;
    const data = { role: a.role, name: a.name, url: a.url, sortOrder: i };
    await db.affiliation.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.log(`✔ ${AFFILIATIONS.length} affiliations`);
}

main()
  .then(async () => {
    await db.$disconnect();
    console.log("✅ Seed complete.");
  })
  .catch(async (err) => {
    console.error("❌ Seed failed:", err);
    await db.$disconnect();
    process.exit(1);
  });
