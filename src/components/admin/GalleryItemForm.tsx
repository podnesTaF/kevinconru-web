"use client";

import { useActionState, useEffect } from "react";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaView } from "@/components/admin/MediaUploader";
import type { GalleryOwner } from "@/lib/actions/gallery";

export type GalleryItemDefaults = {
  id?: string;
  title?: string | null;
  caption?: string | null;
  image?: MediaView | null;
};

export default function GalleryItemForm({
  action,
  owner,
  defaults = {},
  library,
  onDone,
  submitLabel = "Save image",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  owner: GalleryOwner;
  defaults?: GalleryItemDefaults;
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
    <form action={formAction} className="space-y-3 rounded-md border border-rule bg-bg p-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {owner.publicationId && <input type="hidden" name="publicationId" value={owner.publicationId} />}
      {owner.pressItemId && <input type="hidden" name="pressItemId" value={owner.pressItemId} />}
      {owner.exhibitionId && <input type="hidden" name="exhibitionId" value={owner.exhibitionId} />}

      <MediaPicker name="mediaId" label="Image" defaultMedia={defaults.image ?? null} library={library} />
      <FieldError errors={fe?.mediaId} />

      <div>
        <label className={labelCls}>Title (optional)</label>
        <input name="title" defaultValue={defaults.title ?? ""} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Caption (optional)</label>
        <textarea name="caption" defaultValue={defaults.caption ?? ""} rows={2} className={inputCls} />
      </div>

      <FormMessage state={state} />
      <div className="flex items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <button type="button" onClick={onDone} className="text-sm text-muted hover:underline">
          Close
        </button>
      </div>
    </form>
  );
}
