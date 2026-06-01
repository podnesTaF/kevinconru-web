import { adminListMedia } from "@/lib/queries/admin";
import { createPress } from "@/lib/actions/press";
import { toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import PressForm from "@/components/admin/PressForm";

export default async function NewPressPage() {
  const library = toMediaViews(await adminListMedia());
  return (
    <div>
      <PageHeader title="New press item" />
      <PressForm action={createPress} library={library} mode="create" />
    </div>
  );
}
