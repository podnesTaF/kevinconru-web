import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Instrument_Serif, JetBrains_Mono, Newsreader } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Type system: Instrument Serif is the default display face ("editorial"
// pairing), Geist the body, JetBrains Mono the metadata/eyebrows. Newsreader
// backs the switchable "literary" pairing. Each is exposed as a CSS variable.
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Non-default display font — not preloaded; it fetches on first switch to
// the literary pairing.
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
    "Kevin Conru — publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. Brussels.",
  openGraph: {
    type: "website",
    siteName: "Kevin Conru",
    locale: "en_GB",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-palette="bone"
      data-typepair="editorial"
      className={`${geist.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} ${newsreader.variable}`}
    >
      <body>
        {/* Restores the saved palette/type pairing before hydration (see
            public/theme-restore.js). Must be src-based: the App Router injects
            beforeInteractive scripts via React preinit(), which doesn't support
            inline scripts — an inline one renders as a raw <script> that
            React 19 warns about. */}
        <Script src="/theme-restore.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
