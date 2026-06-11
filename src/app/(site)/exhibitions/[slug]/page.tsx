import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExhibitionBySlug, getExhibitionSlugs } from "@/lib/queries/exhibitions";
import WorkDetail, { type WorkDetailView } from "@/components/WorkDetail";

export async function generateStaticParams() {
  try {
    const slugs = await getExhibitionSlugs();
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
  const item = await getExhibitionBySlug(slug);
  if (!item) return {};
  const description =
    item.subtitle ?? (stripHtml(item.body).slice(0, 160) || `${item.venue}, ${item.year}`);
  return { title: item.title, description };
}

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getExhibitionBySlug(slug);
  if (!item) notFound();

  const view: WorkDetailView = {
    publicBase: "/exhibitions",
    crumbLabel: "Exhibitions",
    eyebrow: `${item.venue} · ${item.year}`,
    title: item.title,
    subtitle: item.subtitle,
    body: item.body,
    coverImage: item.coverImage
      ? { url: item.coverImage.url, width: item.coverImage.width, height: item.coverImage.height }
      : null,
    externalUrl: item.externalUrl,
    externalLabel: "Visit ↗",
    gallery: item.gallery.map((g) => ({
      id: g.id,
      title: g.title,
      caption: g.caption,
      imageUrl: g.media.url,
      width: g.media.width,
      height: g.media.height,
    })),
    galleryLayout: item.galleryLayout,
    pdf: item.pdf ? { url: item.pdf.url, bytes: item.pdf.bytes } : null,
  };

  return <WorkDetail view={view} />;
}
