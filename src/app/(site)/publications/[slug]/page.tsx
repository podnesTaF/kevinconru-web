import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicationBySlug,
  getPublicationSlugs,
} from "@/lib/queries/publications";
import { kindLabel } from "@/lib/format";
import { CONTACT } from "@/lib/site";
import { ArrowRight } from "@/components/icons";
import RichText from "@/components/RichText";
import Gallery, { type GalleryView } from "@/components/Gallery";
import PdfEmbed from "@/components/PdfEmbed";

// Prerender published slugs. Resilient: if the DB is unreachable at build time,
// fall back to on-demand rendering instead of failing the build.
export async function generateStaticParams() {
  try {
    const slugs = await getPublicationSlugs();
    return slugs.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return {};
  const description = pub.subtitle ?? stripHtml(pub.body).slice(0, 160);
  return { title: pub.title, description };
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) notFound();

  const coverStyle = {
    "--cover-bg": pub.coverBg ?? undefined,
    "--cover-fg": pub.coverFg ?? undefined,
  } as CSSProperties;

  const gallery: GalleryView[] = pub.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    imageUrl: g.media.url,
    width: g.media.width,
    height: g.media.height,
  }));

  const enquireHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Enquiry — ${pub.title}`)}`;

  const facts: { lab: string; val: string }[] = [
    { lab: "Year", val: String(pub.year) },
    ...(pub.pages ? [{ lab: "Pages", val: String(pub.pages) }] : []),
    ...(pub.publisher ? [{ lab: "Publisher", val: pub.publisher }] : []),
  ];

  return (
    <main className="page">
      <div className="wrap pd">
        <Link className="pd-crumb" href="/publications">
          ← Publications
        </Link>

        {/* Compact hero: cover + header/facts. The body text lives BELOW this
            row so a long text never scrolls beside an empty cover column. */}
        <section className="pd-hero">
          {pub.coverImage ? (
            /* Real cover: shown bare at its natural ratio — nothing cropped. */
            <div
              className="pd-cover"
              style={{
                aspectRatio:
                  pub.coverImage.width && pub.coverImage.height
                    ? `${pub.coverImage.width} / ${pub.coverImage.height}`
                    : "3 / 4",
              }}
            >
              <div
                className="pc-image"
                style={{ backgroundImage: `url('${pub.coverImage.url}')` }}
              />
            </div>
          ) : (
            /* Typographic plate is the fallback when no cover exists. */
            <div className="pd-cover pd-cover--plate" style={coverStyle}>
              <div className="pc-content" style={{ color: pub.coverFg ?? undefined }}>
                <div className="pc-mini">
                  {kindLabel(pub.kind)} · {pub.year}
                </div>
                <div>
                  {pub.publisher && (
                    <div className="pc-mini" style={{ marginBottom: 14 }}>
                      {pub.publisher}
                    </div>
                  )}
                  <div className="pc-title">{pub.title}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <span className="eyebrow">
              {kindLabel(pub.kind)} · {pub.year}
            </span>
            <h1 className="pd-title" style={{ marginTop: 14 }}>
              {pub.title}
            </h1>
            {pub.subtitle && <p className="pd-sub">{pub.subtitle}</p>}
            <div className="pd-facts">
              {facts.map((f) => (
                <div className="pd-fact" key={f.lab}>
                  <span className="lab">{f.lab}</span>
                  <span className="val">{f.val}</span>
                </div>
              ))}
            </div>
            <div className="pd-actions">
              {pub.externalUrl && (
                <a className="link-arrow" href={pub.externalUrl} target="_blank" rel="noopener noreferrer">
                  Visit ↗ <ArrowRight />
                </a>
              )}
              <a className="link-arrow" href={enquireHref}>
                Enquire about this title <ArrowRight />
              </a>
            </div>
          </div>
        </section>

        {/* Body text keeps a reading measure; the gallery and document sit in
            a wider, left-aligned column so page scans stay readable. */}
        <div className="measure">
          <RichText html={pub.body} className="pd-body" />
        </div>

        <div className="measure-wide">
          {gallery.length > 0 && (
            <section style={{ marginTop: "clamp(40px, 7vw, 64px)" }}>
              <Gallery items={gallery} layout={pub.galleryLayout === "List" ? "list" : "grid"} />
            </section>
          )}

          {pub.pdf && (
            <section style={{ marginTop: "clamp(40px, 7vw, 64px)" }}>
              <PdfEmbed url={pub.pdf.url} title={pub.title} bytes={pub.pdf.bytes} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
