"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { REGIONS, KINDS } from "@/lib/validation/schemas";
import { REGION_LABEL, KIND_LABEL } from "@/lib/format";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaView } from "@/components/admin/MediaUploader";

type Defaults = {
  id?: string;
  title?: string;
  slug?: string;
  subtitle?: string | null;
  year?: number;
  pages?: number | null;
  publisher?: string | null;
  region?: string;
  kind?: string;
  summary?: string;
  coverBg?: string | null;
  coverFg?: string | null;
  featured?: boolean;
  published?: boolean;
  coverImage?: MediaView | null;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function PublicationForm({
  action,
  defaults = {},
  library,
  mode,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Defaults;
  library: MediaView[];
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [title, setTitle] = useState(defaults.title ?? "");
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(defaults.slug));
  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {mode === "edit" && defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Title</label>
          <input
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            className={inputCls}
          />
          <FieldError errors={fe?.title} />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Slug</label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            className={inputCls}
          />
          <FieldError errors={fe?.slug} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Subtitle</label>
          <input name="subtitle" defaultValue={defaults.subtitle ?? ""} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Year</label>
          <input name="year" type="number" defaultValue={defaults.year ?? ""} className={inputCls} />
          <FieldError errors={fe?.year} />
        </div>
        <div>
          <label className={labelCls}>Pages</label>
          <input name="pages" type="number" defaultValue={defaults.pages ?? ""} className={inputCls} />
          <FieldError errors={fe?.pages} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Publisher</label>
          <input name="publisher" defaultValue={defaults.publisher ?? ""} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Region</label>
          <select name="region" defaultValue={defaults.region ?? "Oceania"} className={inputCls}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Kind</label>
          <select name="kind" defaultValue={defaults.kind ?? "Monograph"} className={inputCls}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <RichTextEditor name="summary" label="Summary" defaultValue={defaults.summary ?? ""} />
        <FieldError errors={fe?.summary} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Cover background (CSS)</label>
          <input
            name="coverBg"
            defaultValue={defaults.coverBg ?? ""}
            placeholder="linear-gradient(170deg, #2c2826, #16151a)"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Cover text color</label>
          <input name="coverFg" defaultValue={defaults.coverFg ?? "#efe9d8"} className={inputCls} />
        </div>
      </div>

      <MediaPicker name="coverImageId" label="Cover image (optional)" defaultMedia={defaults.coverImage ?? null} library={library} />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={defaults.featured ?? false} />
          Featured on home
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={defaults.published ?? true} />
          Published
        </label>
      </div>

      <FormMessage state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{mode === "create" ? "Create publication" : "Save changes"}</SubmitButton>
        <Link href="/admin/publications" className="text-sm text-zinc-500 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
