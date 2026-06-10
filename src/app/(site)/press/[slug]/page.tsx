import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPressItemBySlug, getPressSlugs } from "@/lib/queries/content";
import { ArrowRight } from "@/components/icons";
import RichText from "@/components/RichText";
import Gallery, { type GalleryView } from "@/components/Gallery";
import PdfEmbed from "@/components/PdfEmbed";

export async function generateStaticParams() {
  try {
    const slugs = await getPressSlugs();
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
  const item = await getPressItemBySlug(slug);
  if (!item) return {};
  const description =
    item.subtitle ?? (stripHtml(item.body).slice(0, 160) || `${item.outlet}, ${item.year}`);
  return { title: item.title, description };
}

export default async function PressDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPressItemBySlug(slug);
  if (!item) notFound();

  const slugs = await getPressSlugs();
  const idx = slugs.findIndex((s) => s.slug === item.slug);
  const next = slugs.length > 1 ? slugs[(idx + 1) % slugs.length] : null;

  const gallery: GalleryView[] = item.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    imageUrl: g.media.url,
    width: g.media.width,
    height: g.media.height,
  }));

  const hasBody = stripHtml(item.body).length > 0;

  return (
    <main className="page">
      <div className="wrap pd">
        <Link className="pd-crumb" href="/press">
          ← Press
        </Link>

        {/* Press covers are portrait (magazine covers/scans) — shown at their
            natural ratio beside the header, same hero as publications. */}
        {item.coverImage ? (
          <section className="pd-hero">
            <div
              className="pd-cover"
              style={{
                aspectRatio:
                  item.coverImage.width && item.coverImage.height
                    ? `${item.coverImage.width} / ${item.coverImage.height}`
                    : "3 / 4",
              }}
            >
              <div
                className="pc-image"
                style={{ backgroundImage: `url('${item.coverImage.url}')` }}
              />
            </div>
            <div>
              <span className="eyebrow">
                {item.outlet} · {item.year}
              </span>
              <h1 className="pd-title" style={{ marginTop: 14 }}>
                {item.title}
              </h1>
              {item.subtitle && <p className="pd-sub">{item.subtitle}</p>}
            </div>
          </section>
        ) : (
          <header style={{ maxWidth: 820, marginBottom: "clamp(32px, 6vw, 48px)" }}>
            <span className="eyebrow">
              {item.outlet} · {item.year}
            </span>
            <h1 className="pd-title" style={{ marginTop: 14 }}>
              {item.title}
            </h1>
            {item.subtitle && <p className="pd-sub">{item.subtitle}</p>}
          </header>
        )}

        {/* Body text keeps a reading measure; page scans and the document sit
            in a wider, left-aligned column so they stay readable. */}
        <div className="measure">
          {hasBody && <RichText html={item.body} className="pd-body" />}

          {item.externalUrl && (
            <div style={{ marginTop: hasBody ? 28 : 0 }}>
              <a className="link-arrow" href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                Read the original ↗ <ArrowRight />
              </a>
            </div>
          )}
        </div>

        <div className="measure-wide">
          {gallery.length > 0 && (
            <section style={{ marginTop: hasBody || item.externalUrl ? "clamp(40px, 7vw, 64px)" : 0 }}>
              <Gallery items={gallery} layout={item.galleryLayout === "List" ? "list" : "grid"} />
            </section>
          )}

          {item.pdf && (
            <section style={{ marginTop: "clamp(40px, 7vw, 64px)" }}>
              <PdfEmbed url={item.pdf.url} title={item.title} bytes={item.pdf.bytes} />
            </section>
          )}
        </div>

        {next && (
          <section style={{ marginTop: "clamp(56px, 11vw, 100px)", paddingTop: 40, borderTop: "1px solid var(--rule)" }}>
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
                <Link href={`/press/${next.slug}`} style={{ display: "block", marginTop: 12 }}>
                  <span className="display" style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1 }}>
                    {next.title}
                  </span>
                </Link>
              </div>
              <Link className="link-arrow" href={`/press/${next.slug}`}>
                Continue <ArrowRight />
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
