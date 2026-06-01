import { adminListMedia } from "@/lib/queries/admin";
import { toMediaViews } from "@/lib/media-view";
import { PageHeader } from "@/components/admin/ui";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  const media = await adminListMedia();
  return (
    <div>
      <PageHeader title="Media" description="Upload images and PDFs; edit alt text; delete unused assets." />
      <MediaLibrary initial={toMediaViews(media)} />
    </div>
  );
}
