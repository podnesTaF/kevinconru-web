import Link from "next/link";
import type { Media, PressItem } from "@/generated/prisma/client";

type PressWithCover = PressItem & { coverImage: Media | null };

// Press index card — uniform portrait frame (3:4) so the grid rows align;
// covers are top-anchored and crop at most ~10% (never into a landscape band).
export default function PressCard({ item, index = 0 }: { item: PressWithCover; index?: number }) {
  const cover = item.coverImage;
  return (
    <Link
      href={`/press/${item.slug}`}
      className="press-card fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="press-card-cover">
        {cover ? (
          <div className="press-card-photo" style={{ backgroundImage: `url('${cover.url}')` }} />
        ) : (
          <div className="press-card-fallback">
            <span className="eyebrow">{item.outlet}</span>
            <span className="display">{item.title}</span>
          </div>
        )}
      </div>
      <div className="press-card-meta">
        <span className="eyebrow">
          {item.outlet} · {item.year}
        </span>
        <h3>{item.title}</h3>
        {item.subtitle && <span className="press-card-sub">{item.subtitle}</span>}
      </div>
    </Link>
  );
}
