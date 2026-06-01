import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Editorial type pairing (locked). Each font is exposed as a CSS variable that
// the token system in globals.css (`--f-display` / `--f-body` / `--f-mono`)
// resolves against.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

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

// Restore the saved palette before first paint to avoid a flash of the default
// (bone) theme. Kept tiny and inlined; mirrors PaletteSwitcher's storage key.
const paletteRestoreScript = `(function(){try{var p=localStorage.getItem("palette");if(p==="bone"||p==="sage"||p==="ink"){document.documentElement.dataset.palette=p;}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-palette="bone"
      className={`${instrumentSerif.variable} ${geist.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: paletteRestoreScript }}
        />
        {children}
      </body>
    </html>
  );
}
