import { adminListMedia } from "@/lib/queries/admin";
import { createExhibition } from "@/lib/actions/exhibitions";
import { toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import WorkForm from "@/components/admin/WorkForm";

export default async function NewExhibitionPage() {
  const library = toMediaViews(await adminListMedia());
  return (
    <div>
      <PageHeader title="New exhibition" description="Save first, then add gallery images on the edit screen." />
      <WorkForm variant="exhibition" action={createExhibition} library={library} mode="create" />
    </div>
  );
}
