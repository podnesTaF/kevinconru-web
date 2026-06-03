import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicationBySlug,
  getPublicationSlugs,
} from "@/lib/queries/publications";
import { kindLabel, regionLabel } from "@/lib/format";
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

  // Next-title cycle across the published list (skip when this is the only one
  // so "Next title" never links back to the current publication).
  const slugs = await getPublicationSlugs();
  const idx = slugs.findIndex((s) => s.slug === pub.slug);
  const next = slugs.length > 1 ? slugs[(idx + 1) % slugs.length] : null;

  const coverStyle = {
    "--cover-bg": pub.coverBg ?? undefined,
    "--cover-fg": pub.coverFg ?? undefined,
    background: pub.coverBg ?? undefined,
  } as CSSProperties;

  const gallery: GalleryView[] = pub.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    imageUrl: g.media.url,
  }));

  const enquireHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Enquiry — ${pub.title}`)}`;

  return (
    <main className="page">
      <div className="wrap pd">
        <Link className="pd-crumb" href="/publications">
          ← Publications
        </Link>

        <section className="pd-hero">
          <div className="pd-cover" style={coverStyle}>
            <div className="pc-content" style={{ color: pub.coverFg ?? undefined }}>
              <div className="pc-mini">
                {regionLabel(pub.region)} · {kindLabel(pub.kind)}
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
            {pub.coverImage && (
              <div
                className="pc-image"
                style={{ backgroundImage: `url('${pub.coverImage.url}')` }}
              />
            )}
          </div>

          <div>
            <span className="eyebrow">
              {kindLabel(pub.kind)} · {pub.year}
            </span>
            <h1 className="pd-title" style={{ marginTop: 16 }}>
              {pub.title}
            </h1>
            {pub.subtitle && (
              <p className="serif-italic" style={{ fontSize: 24, color: "var(--fg-soft)", margin: "-8px 0 24px" }}>
                {pub.subtitle}
              </p>
            )}
            <RichText html={pub.body} className="pd-lead" />
            <div className="pd-specs">
              <div className="pd-spec">
                <span className="lab">Year</span>
                <span className="val">{pub.year}</span>
              </div>
              <div className="pd-spec">
                <span className="lab">Pages</span>
                <span className="val">{pub.pages ?? "—"}</span>
              </div>
              <div className="pd-spec">
                <span className="lab">Publisher</span>
                <span className="val" style={{ fontSize: 16 }}>
                  {pub.publisher ?? "—"}
                </span>
              </div>
              <div className="pd-spec">
                <span className="lab">Region</span>
                <span className="val" style={{ fontSize: 16 }}>
                  {regionLabel(pub.region)}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: "20px 32px" }}>
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

        {gallery.length > 0 && (
          <section>
            <div className="section-head" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow">Gallery</span>
                <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,44px)", marginTop: 12 }}>
                  Selected images
                </h2>
              </div>
            </div>
            <Gallery items={gallery} />
          </section>
        )}

        {pub.pdf && (
          <section style={{ marginTop: gallery.length ? 80 : 0 }}>
            <div className="section-head" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow">Document</span>
                <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,44px)", marginTop: 12 }}>
                  Read the publication
                </h2>
              </div>
            </div>
            <PdfEmbed url={pub.pdf.url} title={pub.title} />
          </section>
        )}

        {next && (
          <section style={{ marginTop: 100, paddingTop: 40, borderTop: "1px solid var(--rule)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <span className="eyebrow">Next title</span>
                <Link href={`/publications/${next.slug}`} style={{ display: "block", marginTop: 12 }}>
                  <span className="display" style={{ fontSize: "clamp(32px,5vw,64px)", lineHeight: 1 }}>
                    {next.title}
                  </span>
                </Link>
              </div>
              <Link className="link-arrow" href={`/publications/${next.slug}`}>
                Continue <ArrowRight />
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
