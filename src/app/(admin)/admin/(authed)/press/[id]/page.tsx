import { notFound } from "next/navigation";
import { adminGetPress, adminListMedia } from "@/lib/queries/admin";
import { updatePress } from "@/lib/actions/press";
import { toMediaView, toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import PressForm from "@/components/admin/PressForm";

export default async function EditPressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, media] = await Promise.all([adminGetPress(id), adminListMedia()]);
  if (!item) notFound();

  return (
    <div>
      <PageHeader title="Edit press item" description={item.title} />
      <PressForm
        action={updatePress}
        mode="edit"
        library={toMediaViews(media)}
        defaults={{
          id: item.id,
          outlet: item.outlet,
          year: item.year,
          title: item.title,
          url: item.url,
          published: item.published,
          file: item.file ? toMediaView(item.file) : null,
        }}
      />
    </div>
  );
}
