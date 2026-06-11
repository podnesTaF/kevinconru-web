import { ImageResponse } from "next/og";

export const alt = "Kevin Conru";
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
          Kevin Conru
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#7a7466", maxWidth: 720, lineHeight: 1.35 }}>
          Publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of
          Oceania.
        </div>
      </div>
    ),
    { ...size },
  );
}
