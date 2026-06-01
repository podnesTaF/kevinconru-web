import type { CSSProperties } from "react";
import type { Media, Publication } from "@/generated/prisma/client";
import { kindLabel, regionLabel } from "@/lib/format";

type PubWithCover = Publication & { coverImage: Media | null };

// Typographic publication cover (index grid). The object photo (if any) reveals
// on hover via `.pc-image`; the typographic plate sits beneath.
export default function PubCover({ pub }: { pub: PubWithCover }) {
  const style = {
    "--cover-bg": pub.coverBg ?? undefined,
    "--cover-fg": pub.coverFg ?? undefined,
  } as CSSProperties;

  return (
    <div className="pub-cover" style={style}>
      <div className="pc-bg" />
      <div className="pc-content">
        <div className="pc-mini">{regionLabel(pub.region)}</div>
        <div>
          <div className="pc-mini" style={{ marginBottom: 10 }}>
            {kindLabel(pub.kind)} · {pub.year}
          </div>
          <div className="pc-title">{pub.title}</div>
        </div>
      </div>
      {pub.coverImage && (
        <div
          className="pc-image"
          style={{ backgroundImage: `url('${pub.coverImage.url}')` }}
        />
      )}
    </div>
  );
}
