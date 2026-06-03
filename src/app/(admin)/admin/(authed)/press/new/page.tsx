import { adminListMedia } from "@/lib/queries/admin";
import { createPress } from "@/lib/actions/press";
import { toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import WorkForm from "@/components/admin/WorkForm";

export default async function NewPressPage() {
  const library = toMediaViews(await adminListMedia());
  return (
    <div>
      <PageHeader title="New press item" description="Save first, then add gallery images on the edit screen." />
      <WorkForm variant="press" action={createPress} library={library} mode="create" />
    </div>
  );
}
