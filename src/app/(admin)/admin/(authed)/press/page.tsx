import Link from "next/link";
import { adminListPress } from "@/lib/queries/admin";
import { setPressPublished, reorderPress, deletePress } from "@/lib/actions/press";
import { PageHeader } from "@/components/admin/ui";
import { ReorderList } from "@/components/admin/controls";
import { workAdminRows } from "@/components/admin/workAdminRows";

export default async function PressAdminPage() {
  const press = await adminListPress();

  const items = workAdminRows(
    press.map((p) => ({
      id: p.id,
      title: p.title,
      meta: `${p.outlet} · ${p.year}`,
      published: p.published,
    })),
    { adminBase: "/admin/press", setPublished: setPressPublished, remove: deletePress },
  );

  return (
    <div>
      <PageHeader
        title="Press"
        description="Drag to reorder."
        action={
          <Link href="/admin/press/new" className="rounded-md bg-fg px-3 py-2 text-sm font-medium text-bg hover:bg-terra">
            + New press item
          </Link>
        }
      />
      {items.length ? <ReorderList items={items} action={reorderPress} /> : <p className="text-sm text-muted">No press items yet.</p>}
    </div>
  );
}
