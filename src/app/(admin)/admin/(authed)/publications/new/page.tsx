import { adminListMedia } from "@/lib/queries/admin";
import { createPublication } from "@/lib/actions/publications";
import { toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import PublicationForm from "@/components/admin/PublicationForm";

export default async function NewPublicationPage() {
  const library = toMediaViews(await adminListMedia());
  return (
    <div>
      <PageHeader title="New publication" />
      <PublicationForm action={createPublication} library={library} mode="create" />
    </div>
  );
}
