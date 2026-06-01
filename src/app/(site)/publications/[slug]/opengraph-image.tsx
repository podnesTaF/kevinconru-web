import { ImageResponse } from "next/og";
import { getPublicationBySlug } from "@/lib/queries/publications";
import { kindLabel, regionLabel } from "@/lib/format";

export const alt = "Publication — Kevin Conru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-publication card mirroring the typographic cover (gradient + title).
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);

  const bg = pub?.coverBg ?? "linear-gradient(160deg, #2a2620, #18171a)";
  const fg = pub?.coverFg ?? "#efe9d8";
  const title = pub?.title ?? "Kevin Conru";
  const eyebrow = pub ? `${regionLabel(pub.region)} · ${kindLabel(pub.kind)} · ${pub.year}` : "";

  // Satori (next/og) renders gradients via `backgroundImage`, not the
  // `background` shorthand — split so a gradient cover doesn't come out flat.
  const bgStyle = bg.includes("gradient") ? { backgroundImage: bg } : { background: bg };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...bgStyle,
          color: fg,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.16em", opacity: 0.7 }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: 88, lineHeight: 1.02, maxWidth: 980 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.26em", opacity: 0.85 }}>
          KEVIN CONRU
        </div>
      </div>
    ),
    { ...size },
  );
}
