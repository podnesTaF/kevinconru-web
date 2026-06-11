import type { CSSProperties } from "react";
import type { Media, Publication } from "@/generated/prisma/client";
import { kindLabel } from "@/lib/format";

type PubWithCover = Publication & { coverImage: Media | null };

// Publication cover (index grid). The cover image (when present) fills the card
// and the title/meta sit inside it, overlaid on a scrim. Without an image we
// fall back to the typographic plate built from coverBg/coverFg.
export default function PubCover({ pub }: { pub: PubWithCover }) {
  const hasImage = !!pub.coverImage;
  const style = hasImage
    ? undefined
    : ({ "--cover-bg": pub.coverBg ?? undefined, "--cover-fg": pub.coverFg ?? undefined } as CSSProperties);

  return (
    <div className={"pub-cover" + (hasImage ? " pub-cover--photo" : "")} style={style}>
      {hasImage ? (
        <div className="pc-photo" style={{ backgroundImage: `url('${pub.coverImage!.url}')` }} />
      ) : (
        <div className="pc-bg" />
      )}
      <div className="pc-overlay">
        <span className="pc-eyebrow">
          {kindLabel(pub.kind)} · {pub.year}
        </span>
        <span className="pc-title">{pub.title}</span>
      </div>
    </div>
  );
}
