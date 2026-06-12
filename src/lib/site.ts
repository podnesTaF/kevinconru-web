// Static site/contact constants used by the chrome (Nav, Footer, contact block).
//
// NOTE: These are placeholders ported from the prototype's `data.jsx`. Once the
// backend lands (overview.md step 2), the Footer/contact data should come from
// the `SiteSettings` singleton instead — see backend.md §2.

export const CONTACT = {
  tel: "+32 478 566 459",
  telHref: "tel:+32478566459",
  email: "kevinconru@yahoo.com",
  facebook: "https://www.facebook.com/kevin.conru/",
  instagram: "https://www.instagram.com/kevinconru/",
  city: "Brussels, Belgium",
} as const;

export const TAGLINE = "Art of Oceania, Africa, and the Americas";

export const FALLBACK_BIO = `<p>Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and on the arts of Oceania. He has travelled extensively in the Pacific and is a member of the Pacific Arts Association and the Oceanic Art Society. He has an Arts Policy MA from The City University, London, and is an orchestral double bassist.</p>
<p>Kevin has published online the South Seas diary of a turn-of-the 20th century Australian journalist, and has produced a major book on the art of the Bismarck Archipelago in Melanesia which was released in September, 2013. This book formed the basis of the Rotterdam Wereld Museum's Ring of Fire exhibition that took place in 2013-2014. He has curated an important exhibition of Papua New Guinea masterpieces from the Royal Museum for Central Africa, which was held in Brussels in 2014.</p>
<p>Along with Robert Hales, he published a comprehensive book on the archive of William Oldman in 2016, and later in 2021, the archive of the Belgian collector/dealer, Baron Freddy Rolin. He has curated and published on the arts of the Sepik / Ramu area of Papua New Guinea in 2019 and the arts of Polynesia in 2023. Both of these publications accompanied related exhibitions which were held at Lempertz Brussels. In 2024, he organised an Oceanic art exhibition that celebrated 100 years of Surrealism for the ARTONOV festival in Brussels. Recently, in 2025, he published the archive of the German Collector, Ernst Heinrich, and a book on A.B. Lewis's personal photographs of New Guinea artefacts from the Field Museum in Chicago.</p>
<p>Kevin Conru is on the advisory board for the Wyvern Research Institute in London, with a brief on African and Oceanic Art. Beyond his curatorial and academic work, he produced two short films: The Oldman Collection — 'Maori Art in London' (2006) and 'Ontong Java, Encounters and Observations' (2023).</p>`;

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/publications", label: "Publications" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/press", label: "Press" },
  { href: "/films", label: "Films" },
] as const;

export const WYVERN_URL = "https://wyvernresearch.org/";

/** Canonical public origin (no trailing slash). Used for metadata + sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kevinconru.com").replace(
  /\/$/,
  "",
);
