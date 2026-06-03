import { ImageResponse } from "next/og";

export const alt = "Kevin Conru — African & Oceanic Art";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social card (editorial bone ground). Uses system fonts to keep the
// edge image generation dependency-free.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#efeadd",
          color: "#1a1814",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.18em", color: "#7a7466" }}>
          BRUSSELS
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 1.0 }}>
          <div style={{ display: "flex", gap: 24 }}>
            <span>African &amp;</span>
            <span style={{ color: "#b35a30", fontStyle: "italic" }}>Oceanic</span>
          </div>
          <div style={{ display: "flex" }}>art.</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: "0.26em" }}>KEVIN CONRU</div>
      </div>
    ),
    { ...size },
  );
}
