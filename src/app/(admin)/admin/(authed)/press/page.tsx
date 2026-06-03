import Link from "next/link";
import { adminListPress } from "@/lib/queries/admin";
import { setPressPublished, reorderPress, deletePress } from "@/lib/actions/press";
import { PageHeader } from "@/components/admin/ui";
import { ReorderList, Toggle, DeleteButton } from "@/components/admin/controls";

export default async function PressAdminPage() {
  const press = await adminListPress();

  const items = press.map((p) => ({
    id: p.id,
    content: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-40">
          <Link href={`/admin/press/${p.id}`} className="block truncate text-sm font-medium hover:underline">
            {p.title}
          </Link>
          <div className="truncate text-xs text-muted">
            {p.outlet} · {p.year}
          </div>
        </div>
        <div className="flex items-center gap-x-3">
          <Toggle id={p.id} value={p.published} action={setPressPublished} labels={["Published", "Draft"]} />
          <Link href={`/admin/press/${p.id}`} className="text-xs font-medium text-fg-soft hover:underline">
            Edit
          </Link>
          <DeleteButton action={deletePress.bind(null, p.id)} confirm={`Delete “${p.title}”?`} />
        </div>
      </div>
    ),
  }));

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
