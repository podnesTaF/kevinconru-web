"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  reorderGallery,
  type GalleryOwner,
} from "@/lib/actions/gallery";
import GalleryItemForm, { type GalleryItemDefaults } from "@/components/admin/GalleryItemForm";
import type { MediaView } from "@/components/admin/MediaUploader";

type Item = GalleryItemDefaults & { id: string; image?: MediaView | null };

export default function GalleryManager({
  owner,
  items,
  library,
}: {
  owner: GalleryOwner;
  items: Item[];
  library: MediaView[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [, start] = useTransition();

  // Local order drives optimistic reordering; `items` is the source of truth
  // (refreshed after add/edit/delete). Reconcile during render so new items
  // appear and deleted ids don't linger (a stale id → phantom reorder → P2025).
  const ids = items.map((i) => i.id);
  const membershipKey = [...ids].sort().join("|");
  const [order, setOrder] = useState(ids);
  const [syncedKey, setSyncedKey] = useState(membershipKey);
  if (membershipKey !== syncedKey) {
    setOrder((prev) => [
      ...prev.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !prev.includes(id)),
    ]);
    setSyncedKey(membershipKey);
  }

  const byId = new Map(items.map((i) => [i.id, i]));
  const done = () => {
    setEditing(null);
    setAdding(false);
    router.refresh();
  };

  const move = (index: number, delta: number) => {
    const next = [...order];
    const t = index + delta;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    setOrder(next);
    start(async () => {
      await reorderGallery(owner, next);
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    start(async () => {
      await deleteGalleryImage(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-rule rounded-md border border-rule bg-bg-alt">
        {order.map((id, i) => {
          const item = byId.get(id);
          if (!item) return null;
          return (
            <li key={id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-2 py-1 text-base leading-none text-muted hover:text-fg-soft disabled:opacity-30">▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="px-2 py-1 text-base leading-none text-muted hover:text-fg-soft disabled:opacity-30">▼</button>
                </div>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-rule bg-bg-alt">
                  {item.image && <Image src={item.image.url} alt="" fill className="object-contain" sizes="48px" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.title || "Untitled"}</div>
                  {item.caption && <div className="truncate text-xs text-muted">{item.caption}</div>}
                </div>
                <button type="button" onClick={() => setEditing(editing === id ? null : id)} className="text-xs font-medium text-fg-soft hover:underline">
                  {editing === id ? "Close" : "Edit"}
                </button>
                <button type="button" onClick={() => remove(id)} className="text-xs font-medium text-terra-deep hover:text-terra">
                  Delete
                </button>
              </div>
              {editing === id && (
                <div className="mt-3">
                  <GalleryItemForm action={updateGalleryImage} owner={owner} defaults={item} library={library} onDone={done} />
                </div>
              )}
            </li>
          );
        })}
        {order.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">No images yet.</li>}
      </ul>

      {adding ? (
        <GalleryItemForm action={addGalleryImage} owner={owner} library={library} onDone={done} submitLabel="Add image" />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md border border-rule px-3 py-1.5 text-sm hover:bg-bg-alt"
        >
          + Add image
        </button>
      )}
    </div>
  );
}
