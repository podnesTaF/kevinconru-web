import Link from "next/link";

// Index grid card for the image-cover work entities (Press + Exhibitions).
// Uniform portrait frame (shared .press-card* styles); `meta` is the outlet
// or venue line.
export type WorkCardItem = {
  slug: string;
  title: string;
  subtitle: string | null;
  coverImage: { url: string } | null;
  meta: string;
  year: number;
};

export default function WorkCard({
  item,
  publicBase,
  index = 0,
}: {
  item: WorkCardItem;
  publicBase: string;
  index?: number;
}) {
  const cover = item.coverImage;
  return (
    <Link
      href={`${publicBase}/${item.slug}`}
      className="press-card fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="press-card-cover">
        {cover ? (
          <div className="press-card-photo" style={{ backgroundImage: `url('${cover.url}')` }} />
        ) : (
          <div className="press-card-fallback">
            <span className="eyebrow">{item.meta}</span>
            <span className="display">{item.title}</span>
          </div>
        )}
      </div>
      <div className="press-card-meta">
        <span className="eyebrow">
          {item.meta} · {item.year}
        </span>
        <h3>{item.title}</h3>
        {item.subtitle && <span className="press-card-sub">{item.subtitle}</span>}
      </div>
    </Link>
  );
}
