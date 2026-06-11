import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import RichText from "@/components/RichText";
import Gallery, { type GalleryView } from "@/components/Gallery";
import PdfEmbed from "@/components/PdfEmbed";

// Shared detail view for the image-cover work entities (Press + Exhibitions).
// The route maps its record into this normalized view; the bespoke Publication
// detail (typographic covers + facts grid) is intentionally separate.

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export type WorkDetailView = {
  publicBase: string;
  crumbLabel: string;
  /** Eyebrow line, e.g. "Art & Antiques · 2009" or "Wereldmuseum · 2018". */
  eyebrow: string;
  title: string;
  subtitle: string | null;
  body: string;
  coverImage: { url: string; width: number | null; height: number | null } | null;
  externalUrl: string | null;
  externalLabel: string;
  gallery: GalleryView[];
  galleryLayout: "Grid" | "List";
  pdf: { url: string; bytes: number } | null;
};

export default function WorkDetail({ view }: { view: WorkDetailView }) {
  const {
    publicBase,
    crumbLabel,
    eyebrow,
    title,
    subtitle,
    body,
    coverImage,
    externalUrl,
    externalLabel,
    gallery,
    galleryLayout,
    pdf,
  } = view;
  const hasBody = stripHtml(body).length > 0;

  return (
    <main className="page">
      <div className="wrap pd">
        <Link className="pd-crumb" href={publicBase}>
          ← {crumbLabel}
        </Link>

        {/* Portrait covers (magazine scans / posters) shown at their natural
            ratio beside the header. */}
        {coverImage ? (
          <section className="pd-hero">
            <div
              className="pd-cover"
              style={{
                aspectRatio:
                  coverImage.width && coverImage.height
                    ? `${coverImage.width} / ${coverImage.height}`
                    : "3 / 4",
              }}
            >
              <div className="pc-image" style={{ backgroundImage: `url('${coverImage.url}')` }} />
            </div>
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h1 className="pd-title" style={{ marginTop: 14 }}>
                {title}
              </h1>
              {subtitle && <p className="pd-sub">{subtitle}</p>}
            </div>
          </section>
        ) : (
          <header style={{ maxWidth: 820, marginBottom: "clamp(32px, 6vw, 48px)" }}>
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="pd-title" style={{ marginTop: 14 }}>
              {title}
            </h1>
            {subtitle && <p className="pd-sub">{subtitle}</p>}
          </header>
        )}

        {/* Body keeps a reading measure; scans + document sit in a wider column. */}
        <div className="measure">
          {hasBody && <RichText html={body} className="pd-body" />}

          {externalUrl && (
            <div style={{ marginTop: hasBody ? 28 : 0 }}>
              <a className="link-arrow" href={externalUrl} target="_blank" rel="noopener noreferrer">
                {externalLabel} <ArrowRight />
              </a>
            </div>
          )}
        </div>

        <div className="measure-wide">
          {gallery.length > 0 && (
            <section style={{ marginTop: hasBody || externalUrl ? "clamp(40px, 7vw, 64px)" : 0 }}>
              <Gallery items={gallery} layout={galleryLayout === "List" ? "list" : "grid"} />
            </section>
          )}

          {pdf && (
            <section style={{ marginTop: "clamp(40px, 7vw, 64px)" }}>
              <PdfEmbed url={pdf.url} title={title} bytes={pdf.bytes} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
