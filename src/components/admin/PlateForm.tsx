"use client";

import { useActionState, useEffect } from "react";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaView } from "@/components/admin/MediaUploader";

export type PlateDefaults = {
  id?: string;
  title?: string;
  region?: string | null;
  dateText?: string | null;
  materials?: string | null;
  dimensions?: string | null;
  provenance?: string | null;
  caption?: string | null;
  image?: MediaView | null;
};

export default function PlateForm({
  action,
  publicationId,
  defaults = {},
  library,
  onDone,
  submitLabel = "Save plate",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  publicationId: string;
  defaults?: PlateDefaults;
  library: MediaView[];
  onDone: () => void;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const fe = state.fieldErrors;

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="publicationId" value={publicationId} />

      <div>
        <label className={labelCls}>Title</label>
        <input name="title" defaultValue={defaults.title ?? ""} className={inputCls} />
        <FieldError errors={fe?.title} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Region</label>
          <input name="region" defaultValue={defaults.region ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input name="dateText" defaultValue={defaults.dateText ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Materials</label>
          <input name="materials" defaultValue={defaults.materials ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Dimensions</label>
          <input name="dimensions" defaultValue={defaults.dimensions ?? ""} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Provenance</label>
        <input name="provenance" defaultValue={defaults.provenance ?? ""} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Caption</label>
        <textarea name="caption" defaultValue={defaults.caption ?? ""} rows={2} className={inputCls} />
      </div>

      <MediaPicker name="imageId" label="Image" defaultMedia={defaults.image ?? null} library={library} />
      <FieldError errors={fe?.imageId} />

      <FormMessage state={state} />
      <div className="flex items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <button type="button" onClick={onDone} className="text-sm text-zinc-500 hover:underline">
          Close
        </button>
      </div>
    </form>
  );
}
