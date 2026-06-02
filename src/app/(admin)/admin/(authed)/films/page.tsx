import Link from "next/link";
import { adminListFilms } from "@/lib/queries/admin";
import { setFilmPublished, reorderFilms, deleteFilm } from "@/lib/actions/films";
import { PageHeader } from "@/components/admin/ui";
import { ReorderList, Toggle, DeleteButton } from "@/components/admin/controls";

export default async function FilmsAdminPage() {
  const films = await adminListFilms();

  const items = films.map((f) => ({
    id: f.id,
    content: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-40">
          <Link href={`/admin/films/${f.id}`} className="block truncate text-sm font-medium hover:underline">
            {f.title}
          </Link>
          <div className="truncate text-xs text-muted">
            {f.year} · {f.youtubeId ? `YouTube ${f.youtubeId}` : "Coming soon"}
          </div>
        </div>
        <div className="flex items-center gap-x-3">
          <Toggle id={f.id} value={f.published} action={setFilmPublished} labels={["Published", "Draft"]} />
          <Link href={`/admin/films/${f.id}`} className="text-xs font-medium text-fg-soft hover:underline">
            Edit
          </Link>
          <DeleteButton action={deleteFilm.bind(null, f.id)} confirm={`Delete “${f.title}”?`} />
        </div>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader
        title="Films"
        description="Drag to reorder."
        action={
          <Link href="/admin/films/new" className="rounded-md bg-fg px-3 py-2 text-sm font-medium text-bg hover:bg-terra">
            + New film
          </Link>
        }
      />
      {items.length ? <ReorderList items={items} action={reorderFilms} /> : <p className="text-sm text-muted">No films yet.</p>}
    </div>
  );
}
