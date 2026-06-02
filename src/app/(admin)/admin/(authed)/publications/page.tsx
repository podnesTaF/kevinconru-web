import Link from "next/link";
import Image from "next/image";
import { adminListPublications } from "@/lib/queries/admin";
import {
  setPublished,
  setFeatured,
  reorderPublications,
  deletePublication,
} from "@/lib/actions/publications";
import { REGION_LABEL, KIND_LABEL } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";
import { ReorderList, Toggle, DeleteButton } from "@/components/admin/controls";

export default async function PublicationsAdminPage() {
  const pubs = await adminListPublications();

  const items = pubs.map((p) => ({
    id: p.id,
    content: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded border border-rule" style={{ background: p.coverBg ?? "#e5dfcf" }}>
          {p.coverImage && <Image src={p.coverImage.url} alt="" fill className="object-contain p-1" sizes="44px" />}
        </div>
        <div className="min-w-0 flex-1 basis-40">
          <Link href={`/admin/publications/${p.id}`} className="block truncate text-sm font-medium hover:underline">
            {p.title}
          </Link>
          <div className="truncate text-xs text-muted">
            {p.year} · {REGION_LABEL[p.region]} · {KIND_LABEL[p.kind]}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Toggle id={p.id} value={p.published} action={setPublished} labels={["Published", "Draft"]} />
          <Toggle id={p.id} value={p.featured} action={setFeatured} labels={["Featured", "Not featured"]} />
          <Link href={`/admin/publications/${p.id}`} className="text-xs font-medium text-fg-soft hover:underline">
            Edit
          </Link>
          <DeleteButton action={deletePublication.bind(null, p.id)} confirm={`Delete “${p.title}”?`} />
        </div>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader
        title="Publications"
        description="Drag to reorder; toggle published / featured."
        action={
          <Link href="/admin/publications/new" className="rounded-md bg-fg px-3 py-2 text-sm font-medium text-bg hover:bg-terra">
            + New publication
          </Link>
        }
      />
      {items.length ? (
        <ReorderList items={items} action={reorderPublications} />
      ) : (
        <p className="text-sm text-muted">No publications yet.</p>
      )}
    </div>
  );
}
