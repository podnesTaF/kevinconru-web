import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicationBySlug,
  getPublicationSlugs,
} from "@/lib/queries/publications";
import type { GalleryView } from "@/components/Gallery";
import PublicationDetail, { type PublicationDetailView } from "@/components/PublicationDetail";

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

  const gallery: GalleryView[] = pub.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    imageUrl: g.media.url,
    width: g.media.width,
    height: g.media.height,
  }));

  const view: PublicationDetailView = {
    title: pub.title,
    subtitle: pub.subtitle,
    body: pub.body,
    year: pub.year,
    pages: pub.pages,
    publisher: pub.publisher,
    kind: pub.kind,
    coverBg: pub.coverBg,
    coverFg: pub.coverFg,
    coverImage: pub.coverImage
      ? { url: pub.coverImage.url, width: pub.coverImage.width, height: pub.coverImage.height }
      : null,
    externalUrl: pub.externalUrl,
    gallery,
    galleryLayout: pub.galleryLayout,
    pdf: pub.pdf ? { url: pub.pdf.url, bytes: pub.pdf.bytes } : null,
  };

  return <PublicationDetail view={view} />;
}
