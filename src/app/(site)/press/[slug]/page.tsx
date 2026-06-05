import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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

  const gallery: GalleryView[] = item.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    imageUrl: g.media.url,
  }));

  const hasBody = stripHtml(item.body).length > 0;

  return (
    <main className="page">
      <div className="wrap pd">
        <Link className="pd-crumb" href="/press">
          ← Press
        </Link>

        {/* Press covers are portrait (magazine covers/scans) — show them at
            their natural ratio beside the header instead of cropping them
            into a landscape banner. */}
        <div className={item.coverImage ? "press-hero" : undefined}>
          {item.coverImage && (
            <div
              className="press-cover"
              style={{
                aspectRatio:
                  item.coverImage.width && item.coverImage.height
                    ? `${item.coverImage.width} / ${item.coverImage.height}`
                    : "3 / 4",
              }}
            >
              <Image
                src={item.coverImage.url}
                alt={item.coverImage.alt ?? item.title}
                fill
                sizes="(max-width: 900px) 100vw, 380px"
                className="press-cover-img"
              />
            </div>
          )}
          <header style={item.coverImage ? undefined : { maxWidth: 820, marginBottom: 48 }}>
            <span className="eyebrow">
              {item.outlet} · {item.year}
            </span>
            <h1 className="pd-title" style={{ marginTop: 16 }}>
              {item.title}
            </h1>
            {item.subtitle && (
              <p className="serif-italic" style={{ fontSize: "clamp(18px, 4.5vw, 22px)", color: "var(--fg-soft)", margin: "-4px 0 0" }}>
                {item.subtitle}
              </p>
            )}
          </header>
        </div>

        {hasBody && <RichText html={item.body} className="press-body" />}

        {item.externalUrl && (
          <div style={{ marginTop: 32 }}>
            <a className="link-arrow" href={item.externalUrl} target="_blank" rel="noopener noreferrer">
              Read the original ↗ <ArrowRight />
            </a>
          </div>
        )}

        {/* Gallery flows as part of the body — page scans read like the article. */}
        {gallery.length > 0 && (
          <section style={{ marginTop: hasBody || item.coverImage ? "clamp(32px, 6vw, 56px)" : 0 }}>
            <Gallery items={gallery} layout={item.galleryLayout === "List" ? "list" : "grid"} />
          </section>
        )}

        {item.pdf && (
          <section style={{ marginTop: "clamp(48px, 9vw, 80px)" }}>
            <div className="section-head" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow">Document</span>
                <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,44px)", marginTop: 12 }}>
                  Read the article
                </h2>
              </div>
            </div>
            <PdfEmbed url={item.pdf.url} title={item.title} bytes={item.pdf.bytes} />
          </section>
        )}
      </div>
    </main>
  );
}
