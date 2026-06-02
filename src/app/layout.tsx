import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Instrument_Serif, JetBrains_Mono, Newsreader } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Fonts for all three switchable type pairings (see globals.css
// `html[data-typepair]`): editorial = Instrument Serif, modern = Geist,
// literary = Newsreader. Geist is also the body font; JetBrains Mono is for
// metadata/eyebrows. Each is exposed as a CSS variable.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Non-default display fonts — not preloaded; they fetch on first switch to
// the editorial / literary pairing (Geist + JetBrains Mono cover the default).
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kevin Conru — African & Oceanic Art",
    template: "%s — Kevin Conru",
  },
  description:
    "Kevin Conru — dealer, curator and publisher of African and Oceanic art. Brussels.",
  openGraph: {
    type: "website",
    siteName: "Kevin Conru",
    locale: "en_GB",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

// Restore saved palette + type pairing before first paint (no flash of the
// defaults). Mirrors the PaletteSwitcher / TypographySwitcher storage keys.
const themeRestoreScript = `(function(){try{var d=document.documentElement;var p=localStorage.getItem("palette");if(p==="bone"||p==="sage"||p==="ink")d.dataset.palette=p;var t=localStorage.getItem("typepair");if(t==="editorial"||t==="modern"||t==="literary")d.dataset.typepair=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-palette="bone"
      data-typepair="modern"
      className={`${geist.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} ${newsreader.variable}`}
    >
      <body>
        {/* Injected into the initial HTML and run before hydration (no flash of
            the default palette/type pairing). Uses next/script rather than a raw
            <script> so React 19 doesn't warn about non-executing script tags. */}
        <Script id="theme-restore" strategy="beforeInteractive">
          {themeRestoreScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
