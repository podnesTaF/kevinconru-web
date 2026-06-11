import { notFound } from "next/navigation";
import { adminGetExhibition, adminListMedia } from "@/lib/queries/admin";
import { updateExhibition } from "@/lib/actions/exhibitions";
import { toMediaView, toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import WorkForm from "@/components/admin/WorkForm";
import GalleryManager from "@/components/admin/GalleryManager";

export default async function EditExhibitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, media] = await Promise.all([adminGetExhibition(id), adminListMedia()]);
  if (!item) notFound();

  const library = toMediaViews(media);

  const gallery = item.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    image: toMediaView(g.media),
  }));

  return (
    <div>
      <PageHeader title="Edit exhibition" description={item.title} />
      <WorkForm
        variant="exhibition"
        action={updateExhibition}
        mode="edit"
        library={library}
        defaults={{
          id: item.id,
          slug: item.slug,
          venue: item.venue,
          year: item.year,
          title: item.title,
          subtitle: item.subtitle,
          body: item.body,
          externalUrl: item.externalUrl,
          published: item.published,
          coverImage: item.coverImage ? toMediaView(item.coverImage) : null,
          pdf: item.pdf ? toMediaView(item.pdf) : null,
          galleryLayout: item.galleryLayout,
        }}
        belowBody={
          <section className="rounded-lg border border-rule bg-bg-alt p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Gallery</h2>
            <p className="mt-1 mb-3 text-xs text-muted">
              Shown after the body — as a grid with lightbox, or page by page (set the layout in Details).
            </p>
            <GalleryManager
              owner={{ publicationId: null, pressItemId: null, exhibitionId: item.id }}
              items={gallery}
              library={library}
            />
          </section>
        }
      />
    </div>
  );
}
