"use client";

import { useState } from "react";
import Image from "next/image";
import { labelCls } from "@/components/admin/ui";
import MediaUploader, { type MediaView } from "@/components/admin/MediaUploader";

// Image/file picker backed by a hidden input (`name`) holding the mediaId.
// Lists the existing library or uploads a new asset.
export default function MediaPicker({
  name,
  label,
  defaultMedia,
  library,
  accept = "image/*",
}: {
  name: string;
  label?: string;
  defaultMedia?: MediaView | null;
  library: MediaView[];
  accept?: string;
}) {
  const [items, setItems] = useState<MediaView[]>(library);
  const [selected, setSelected] = useState<MediaView | null>(defaultMedia ?? null);
  const [open, setOpen] = useState(false);

  const choose = (m: MediaView) => {
    setSelected(m);
    setOpen(false);
  };

  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
          {selected ? (
            <Image src={selected.url} alt={selected.alt ?? ""} fill className="object-contain" sizes="64px" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-zinc-400">None</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
        >
          {selected ? "Change" : "Choose"}
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Select media</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-900">
                ✕
              </button>
            </div>

            <div className="border-b border-zinc-200 px-4 py-3">
              <MediaUploader
                accept={accept}
                onUploaded={(m) => {
                  setItems((prev) => [m, ...prev]);
                  choose(m);
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => choose(m)}
                  className="relative aspect-square overflow-hidden rounded border border-zinc-200 bg-zinc-100 hover:ring-2 hover:ring-zinc-900"
                >
                  <Image src={m.url} alt={m.alt ?? ""} fill className="object-contain" sizes="120px" />
                </button>
              ))}
              {items.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-zinc-400">No media yet — upload one above.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
