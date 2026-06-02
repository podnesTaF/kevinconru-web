import { notFound } from "next/navigation";
import { adminGetPublication, adminListMedia } from "@/lib/queries/admin";
import { updatePublication } from "@/lib/actions/publications";
import { toMediaView, toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import PublicationForm from "@/components/admin/PublicationForm";
import PlatesManager from "@/components/admin/PlatesManager";

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
    region: pub.region,
    kind: pub.kind,
    summary: pub.summary,
    coverBg: pub.coverBg,
    coverFg: pub.coverFg,
    featured: pub.featured,
    published: pub.published,
    coverImage: pub.coverImage ? toMediaView(pub.coverImage) : null,
    pdf: pub.pdf ? toMediaView(pub.pdf) : null,
  };

  const plates = pub.plates.map((pl) => ({
    id: pl.id,
    title: pl.title,
    region: pl.region,
    dateText: pl.dateText,
    materials: pl.materials,
    dimensions: pl.dimensions,
    provenance: pl.provenance,
    caption: pl.caption,
    image: toMediaView(pl.image),
  }));

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Edit publication" description={pub.title} />
        <PublicationForm action={updatePublication} defaults={defaults} library={library} mode="edit" />
      </div>

      <div className="max-w-2xl">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Plates</h2>
        <PlatesManager publicationId={pub.id} plates={plates} library={library} />
      </div>
    </div>
  );
}
