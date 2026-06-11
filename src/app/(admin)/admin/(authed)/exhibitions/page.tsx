import Link from "next/link";
import { adminListExhibitions } from "@/lib/queries/admin";
import { setExhibitionPublished, reorderExhibitions, deleteExhibition } from "@/lib/actions/exhibitions";
import { PageHeader } from "@/components/admin/ui";
import { ReorderList } from "@/components/admin/controls";
import { workAdminRows } from "@/components/admin/workAdminRows";

export default async function ExhibitionsAdminPage() {
  const exhibitions = await adminListExhibitions();

  const items = workAdminRows(
    exhibitions.map((e) => ({
      id: e.id,
      title: e.title,
      meta: `${e.venue} · ${e.year}`,
      published: e.published,
    })),
    { adminBase: "/admin/exhibitions", setPublished: setExhibitionPublished, remove: deleteExhibition },
  );

  return (
    <div>
      <PageHeader
        title="Exhibitions"
        description="Drag to reorder."
        action={
          <Link href="/admin/exhibitions/new" className="rounded-md bg-fg px-3 py-2 text-sm font-medium text-bg hover:bg-terra">
            + New exhibition
          </Link>
        }
      />
      {items.length ? (
        <ReorderList items={items} action={reorderExhibitions} />
      ) : (
        <p className="text-sm text-muted">No exhibitions yet.</p>
      )}
    </div>
  );
}
