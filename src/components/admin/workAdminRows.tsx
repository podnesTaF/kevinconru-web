import Link from "next/link";
import Image from "next/image";
import { Toggle, DeleteButton } from "@/components/admin/controls";

// Shared row builder for the admin index lists (Publications / Press /
// Exhibitions). Each list page maps its rows to this shape and feeds the
// result to <ReorderList />. Cover thumbnail + the "featured" toggle are
// opt-in (publications only).

export type WorkAdminRow = {
  id: string;
  title: string;
  /** Secondary line, e.g. "2009 · Monograph" or "Wereldmuseum · 2018". */
  meta: string;
  published: boolean;
  featured?: boolean;
  coverImage?: { url: string } | null;
  coverBg?: string | null;
};

export type WorkAdminRowConfig = {
  adminBase: string;
  setPublished: (id: string, value: boolean) => Promise<void>;
  setFeatured?: (id: string, value: boolean) => Promise<void>;
  remove: (id: string) => Promise<unknown>;
  showCover?: boolean;
};

export function workAdminRows(rows: WorkAdminRow[], cfg: WorkAdminRowConfig) {
  return rows.map((r) => ({
    id: r.id,
    content: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {cfg.showCover && (
          <div
            className="relative h-14 w-11 shrink-0 overflow-hidden rounded border border-rule"
            style={{ background: r.coverBg ?? "#e5dfcf" }}
          >
            {r.coverImage && (
              <Image src={r.coverImage.url} alt="" fill className="object-contain p-1" sizes="44px" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1 basis-40">
          <Link
            href={`${cfg.adminBase}/${r.id}`}
            className="block truncate text-sm font-medium hover:underline"
          >
            {r.title}
          </Link>
          <div className="truncate text-xs text-muted">{r.meta}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Toggle id={r.id} value={r.published} action={cfg.setPublished} labels={["Published", "Draft"]} />
          {cfg.setFeatured && (
            <Toggle
              id={r.id}
              value={r.featured ?? false}
              action={cfg.setFeatured}
              labels={["Featured", "Not featured"]}
            />
          )}
          <Link
            href={`${cfg.adminBase}/${r.id}`}
            className="text-xs font-medium text-fg-soft hover:underline"
          >
            Edit
          </Link>
          <DeleteButton action={cfg.remove.bind(null, r.id)} confirm={`Delete “${r.title}”?`} />
        </div>
      </div>
    ),
  }));
}
