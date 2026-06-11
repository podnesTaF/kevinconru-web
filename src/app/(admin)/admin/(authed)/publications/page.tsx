import Link from "next/link";
import { adminListPublications } from "@/lib/queries/admin";
import {
  setPublished,
  setFeatured,
  reorderPublications,
  deletePublication,
} from "@/lib/actions/publications";
import { KIND_LABEL } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";
import { ReorderList } from "@/components/admin/controls";
import { workAdminRows } from "@/components/admin/workAdminRows";

export default async function PublicationsAdminPage() {
  const pubs = await adminListPublications();

  const items = workAdminRows(
    pubs.map((p) => ({
      id: p.id,
      title: p.title,
      meta: `${p.year} · ${KIND_LABEL[p.kind]}`,
      published: p.published,
      featured: p.featured,
      coverImage: p.coverImage,
      coverBg: p.coverBg,
    })),
    {
      adminBase: "/admin/publications",
      setPublished,
      setFeatured,
      remove: deletePublication,
      showCover: true,
    },
  );

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
