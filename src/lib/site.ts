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

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/publications", label: "Publications" },
  { href: "/press", label: "Press" },
  { href: "/exhibitions", label: "Exhibitions" },
] as const;

export const WYVERN_URL = "https://wyvernresearch.org/";

/** Canonical public origin (no trailing slash). Used for metadata + sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kevinconru.com").replace(
  /\/$/,
  "",
);
