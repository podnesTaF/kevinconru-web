"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Defaults = {
  id?: string;
  title?: string;
  year?: number;
  youtubeId?: string | null;
  startSeconds?: number | null;
  intro?: string;
  published?: boolean;
};

export default function FilmForm({
  action,
  defaults = {},
  mode,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Defaults;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {mode === "edit" && defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <div>
        <label className={labelCls}>Title</label>
        <input name="title" defaultValue={defaults.title ?? ""} className={inputCls} />
        <FieldError errors={fe?.title} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Year</label>
          <input name="year" type="number" defaultValue={defaults.year ?? ""} className={inputCls} />
          <FieldError errors={fe?.year} />
        </div>
        <div>
          <label className={labelCls}>YouTube ID or URL</label>
          <input name="youtubeId" defaultValue={defaults.youtubeId ?? ""} placeholder="empty = coming soon" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Start (seconds)</label>
          <input name="startSeconds" type="number" defaultValue={defaults.startSeconds ?? ""} className={inputCls} />
        </div>
      </div>

      <div>
        <RichTextEditor name="intro" label="Intro" defaultValue={defaults.intro ?? ""} />
        <FieldError errors={fe?.intro} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={defaults.published ?? true} />
        Published
      </label>

      <FormMessage state={state} />
      <div className="flex items-center gap-3">
        <SubmitButton>{mode === "create" ? "Create film" : "Save changes"}</SubmitButton>
        <Link href="/admin/films" className="text-sm text-muted hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
