import { notFound } from "next/navigation";
import { adminGetPublication, adminListMedia } from "@/lib/queries/admin";
import { updatePublication } from "@/lib/actions/publications";
import { toMediaView, toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import WorkForm from "@/components/admin/WorkForm";
import GalleryManager from "@/components/admin/GalleryManager";

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pub, media] = await Promise.all([adminGetPublication(id), adminListMedia()]);
  if (!pub) notFound();

  const library = toMediaViews(media);

  const defaults = {
    id: pub.id,
    title: pub.title,
    slug: pub.slug,
    subtitle: pub.subtitle,
    year: pub.year,
    pages: pub.pages,
    publisher: pub.publisher,
    kind: pub.kind,
    body: pub.body,
    coverBg: pub.coverBg,
    coverFg: pub.coverFg,
    externalUrl: pub.externalUrl,
    featured: pub.featured,
    published: pub.published,
    coverImage: pub.coverImage ? toMediaView(pub.coverImage) : null,
    pdf: pub.pdf ? toMediaView(pub.pdf) : null,
    galleryLayout: pub.galleryLayout,
  };

  const gallery = pub.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    image: toMediaView(g.media),
  }));

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Edit publication" description={pub.title} />
        <WorkForm variant="publication" action={updatePublication} defaults={defaults} library={library} mode="edit" />
      </div>

      <section className="max-w-3xl rounded-lg border border-rule bg-bg-alt p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Gallery</h2>
        <p className="mt-1 mb-3 text-xs text-muted">
          A grid gallery shown below the body, with a lightbox (title + caption per image).
        </p>
        <GalleryManager
          owner={{ publicationId: pub.id, pressItemId: null, exhibitionId: null }}
          items={gallery}
          library={library}
        />
      </section>
    </div>
  );
}
