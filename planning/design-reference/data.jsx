// ─────────────────────────────────────────────────────────────────────────
// Kevin Conru — real catalogue, drawn from the client's bio + requirements.
// Cover art is generated (typographic plates); the two New Ireland object
// photographs supplied are used as feature imagery where noted.
// Plate captions on detail pages are editable placeholders.
// ─────────────────────────────────────────────────────────────────────────

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
    summary: "A. B. Lewis's own field photographs of New Guinea artefacts, assembled and annotated for the first time — a quiet, foundational record of early twentieth-century Melanesian material culture.",
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
    summary: "The complete archive of the German collector Ernst Heinrich, published with full provenance and historical apparatus.",
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
    summary: "Curated by Kevin Conru and published to accompany the related exhibition at Lempertz Brussels, this volume surveys the sculptural arts of Polynesia.",
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
    summary: "A focused study of the Polynesian Outliers — the small, culturally Polynesian communities scattered through Melanesia and Micronesia, and the distinctive objects they produced.",
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
    summary: "The archive of the Belgian collector and dealer Baron Freddy Rolin — correspondence, photographs and object records spanning a lifetime in tribal art.",
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
    summary: "Curated by Kevin Conru and published alongside the exhibition at Lempertz Brussels, this catalogue gathers carved ancestors and ceremonial objects from the Sepik and Ramu river systems.",
    plates: [
      { id: "p1", title: "Headdress", region: "Ramu River, New Guinea", date: "c. 1900", materials: "Wood, pigment, fibre, feathers", dims: "62 × 38 × 30 cm", provenance: "Private collection, Brussels.", image: "assets/object-headdress.jpg", caption: "A composite ceremonial headdress incorporating multiple zoomorphic registers — a rare survival of full plumage." },
      { id: "p2", title: "Mask", region: "Lower Sepik, New Guinea", date: "c. 1890", materials: "Wood, pigments, fibre, shell", dims: "44 × 22 × 18 cm", provenance: "Pierre Loeb, Paris; private collection.", image: "assets/object-mask.jpg", caption: "Carved from a single block and polychromed with lime, ochre and charcoal pigment." },
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
    summary: "Published with Robert Hales: a comprehensive study of the archive of William Oldman, one of the most significant dealers in Oceanic and ethnographic art of the twentieth century.",
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
    summary: "A major survey of the art of the Bismarck Archipelago in Melanesia, released in September 2013. The book formed the basis of the Rotterdam Wereldmuseum's Ring of Fire exhibition, 2013–2014.",
    plates: [
      { id: "p1", title: "Tatanua Mask", region: "New Ireland, Papua New Guinea", date: "c. 1890", materials: "Wood, pigments, fibre, glass", dims: "44 × 22 × 18 cm", provenance: "Pierre Loeb, Paris; private collection, Brussels.", image: "assets/object-mask.jpg", caption: "Carved in a single block of softwood, polychromed with lime, ochre and charcoal pigment — attributable to the Lossuk River workshops." },
      { id: "p2", title: "Malagan Helmet Mask", region: "Northern New Ireland", date: "c. 1900", materials: "Wood, paint, fibre, snail shell", dims: "62 × 38 × 30 cm", provenance: "Collected 1907; Linden-Museum Stuttgart; private collection.", image: "assets/object-headdress.jpg", caption: "An extraordinary composite Malagan figure incorporating fish, bird-snake and ancestor registers." },
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
    summary: "An early and defining study of Southern African art — the headrests, staffs, vessels and figurative sculpture for which Kevin Conru first became known.",
  },
];

// Short films — embedded on the About page
const FILMS = [
  {
    id: "ontong-java",
    title: "Ontong Java — Encounters & Observations",
    year: 2023,
    youtube: "eq7e28pEuL4",
    start: 45,
    intro: "A short film made from early twentieth-century visual sources taken on Ontong Java Atoll, the majority of which are unknown.",
  },
  {
    id: "surrealism",
    title: "Oceanic Art & 100 Years of Surrealism",
    year: 2024,
    youtube: "YsdygtWSkxk",
    intro: "Curated by Kevin Conru, this exhibition — commemorating 100 years of Surrealism as an international artistic movement — presents artworks from the Pacific Islands (New Guinea, New Britain, Vanuatu and Easter Island) which greatly influenced the artists of the time and which continue to stimulate the imagination today.",
  },
  {
    id: "oldman-film",
    title: "The Oldman Collection — Maori Art in London",
    year: 2006,
    youtube: null,
    intro: "An early film documenting the William Oldman collection of Maori art in London.",
  },
];

const PRESS = [
  { outlet: "Conru Online", year: 2025, title: "Special Conru Online insert" },
  { outlet: "ARTONOV Festival", year: 2024, title: "100 Years of Surrealism — Oceanic Art" },
  { outlet: "Lempertz", year: 2023, title: "Polynesia — exhibition feature" },
  { outlet: "Wereldmuseum Rotterdam", year: 2013, title: "Ring of Fire" },
];

const CONTACT = {
  tel: "+32 478 566 459",
  telHref: "tel:+32478566459",
  email: "kevinconru@yahoo.com",
  facebook: "https://www.facebook.com/kevin.conru/",
  instagram: "https://www.instagram.com/kevinconru/",
  city: "Brussels, Belgium",
};

window.PUBLICATIONS = PUBLICATIONS;
window.FILMS = FILMS;
window.PRESS = PRESS;
window.CONTACT = CONTACT;
