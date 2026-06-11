import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { WORKS, type WorkKind } from "@/lib/works/config";
import { adminGetPublication, adminGetExhibition, adminGetPress } from "@/lib/queries/admin";
import type { GalleryView } from "@/components/Gallery";
import WorkDetail, { type WorkDetailView } from "@/components/WorkDetail";
import PublicationDetail, { type PublicationDetailView } from "@/components/PublicationDetail";
import PreviewBanner from "@/components/PreviewBanner";

// Authed, always-live preview of a single work — including unpublished drafts.
// Renders the exact public detail components with the admin (unfiltered) query,
// inside the public site shell (Nav/Footer), so it mirrors the live page.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

function isWorkKind(v: string): v is WorkKind {
  return v === "publication" || v === "press" || v === "exhibition";
}

type GalleryRow = {
  id: string;
  title: string | null;
  caption: string | null;
  media: { url: string; width: number | null; height: number | null };
};

const toGallery = (gallery: GalleryRow[]): GalleryView[] =>
  gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    imageUrl: g.media.url,
    width: g.media.width,
    height: g.media.height,
  }));

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  // Authoritative guard — preview shows draft content, so admin-only.
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");

  const { kind, id } = await params;
  if (!isWorkKind(kind)) notFound();

  const cfg = WORKS[kind];
  const editHref = `${cfg.adminBase}/${id}`;

  if (kind === "publication") {
    const pub = await adminGetPublication(id);
    if (!pub) notFound();
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
      gallery: toGallery(pub.gallery),
      galleryLayout: pub.galleryLayout,
      pdf: pub.pdf ? { url: pub.pdf.url, bytes: pub.pdf.bytes } : null,
    };
    return (
      <>
        <PublicationDetail view={view} />
        <PreviewBanner published={pub.published} editHref={editHref} label={pub.title} />
      </>
    );
  }

  if (kind === "exhibition") {
    const item = await adminGetExhibition(id);
    if (!item) notFound();
    const view: WorkDetailView = {
      publicBase: cfg.publicBase,
      crumbLabel: cfg.navLabel,
      eyebrow: `${item.venue} · ${item.year}`,
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      coverImage: item.coverImage
        ? { url: item.coverImage.url, width: item.coverImage.width, height: item.coverImage.height }
        : null,
      externalUrl: item.externalUrl,
      externalLabel: "Visit ↗",
      gallery: toGallery(item.gallery),
      galleryLayout: item.galleryLayout,
      pdf: item.pdf ? { url: item.pdf.url, bytes: item.pdf.bytes } : null,
    };
    return (
      <>
        <WorkDetail view={view} />
        <PreviewBanner published={item.published} editHref={editHref} label={item.title} />
      </>
    );
  }

  // press
  const item = await adminGetPress(id);
  if (!item) notFound();
  const view: WorkDetailView = {
    publicBase: cfg.publicBase,
    crumbLabel: cfg.navLabel,
    eyebrow: `${item.outlet} · ${item.year}`,
    title: item.title,
    subtitle: item.subtitle,
    body: item.body,
    coverImage: item.coverImage
      ? { url: item.coverImage.url, width: item.coverImage.width, height: item.coverImage.height }
      : null,
    externalUrl: item.externalUrl,
    externalLabel: "Read the original ↗",
    gallery: toGallery(item.gallery),
    galleryLayout: item.galleryLayout,
    pdf: item.pdf ? { url: item.pdf.url, bytes: item.pdf.bytes } : null,
  };
  return (
    <>
      <WorkDetail view={view} />
      <PreviewBanner published={item.published} editHref={editHref} label={item.title} />
    </>
  );
}
