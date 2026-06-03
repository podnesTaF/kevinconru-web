import { adminListMedia } from "@/lib/queries/admin";
import { createPublication } from "@/lib/actions/publications";
import { toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import WorkForm from "@/components/admin/WorkForm";

export default async function NewPublicationPage() {
  const library = toMediaViews(await adminListMedia());
  return (
    <div>
      <PageHeader title="New publication" description="Save first, then add gallery images on the edit screen." />
      <WorkForm variant="publication" action={createPublication} library={library} mode="create" />
    </div>
  );
}
