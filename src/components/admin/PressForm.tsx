"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaView } from "@/components/admin/MediaUploader";

type Defaults = {
  id?: string;
  outlet?: string;
  year?: number;
  title?: string;
  url?: string | null;
  published?: boolean;
  file?: MediaView | null;
};

export default function PressForm({
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
  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {mode === "edit" && defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className={labelCls}>Outlet</label>
          <input name="outlet" defaultValue={defaults.outlet ?? ""} className={inputCls} />
          <FieldError errors={fe?.outlet} />
        </div>
        <div>
          <label className={labelCls}>Year</label>
          <input name="year" type="number" defaultValue={defaults.year ?? ""} className={inputCls} />
          <FieldError errors={fe?.year} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Title</label>
        <input name="title" defaultValue={defaults.title ?? ""} className={inputCls} />
        <FieldError errors={fe?.title} />
      </div>

      <div>
        <label className={labelCls}>External URL (optional)</label>
        <input name="url" defaultValue={defaults.url ?? ""} placeholder="https://…" className={inputCls} />
        <FieldError errors={fe?.url} />
      </div>

      <MediaPicker
        name="fileId"
        label="PDF / file (optional)"
        defaultMedia={defaults.file ?? null}
        library={library}
        accept="application/pdf,image/*"
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={defaults.published ?? true} />
        Published
      </label>

      <FormMessage state={state} />
      <div className="flex items-center gap-3">
        <SubmitButton>{mode === "create" ? "Create press item" : "Save changes"}</SubmitButton>
        <Link href="/admin/press" className="text-sm text-muted hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
