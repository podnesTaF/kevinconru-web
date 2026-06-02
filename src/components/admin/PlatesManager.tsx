"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addPlate, updatePlate, deletePlate, reorderPlates } from "@/lib/actions/publications";
import PlateForm, { type PlateDefaults } from "@/components/admin/PlateForm";
import type { MediaView } from "@/components/admin/MediaUploader";

type Plate = PlateDefaults & { id: string; title: string; image?: MediaView | null };

export default function PlatesManager({
  publicationId,
  plates,
  library,
}: {
  publicationId: string;
  plates: Plate[];
  library: MediaView[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [, start] = useTransition();

  // Local order drives optimistic reordering, but `plates` is the source of
  // truth (refreshed by router.refresh() after add/edit/delete). Reconcile
  // during render so newly added plates appear and deleted ids don't linger in
  // `order` (a stale id would make the next reorder POST a phantom id → P2025).
  const plateIds = plates.map((p) => p.id);
  const membershipKey = [...plateIds].sort().join("|");
  const [order, setOrder] = useState(plateIds);
  const [syncedKey, setSyncedKey] = useState(membershipKey);
  if (membershipKey !== syncedKey) {
    setOrder((prev) => [
      ...prev.filter((id) => plateIds.includes(id)),
      ...plateIds.filter((id) => !prev.includes(id)),
    ]);
    setSyncedKey(membershipKey);
  }

  const byId = new Map(plates.map((p) => [p.id, p]));
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
      await reorderPlates(publicationId, next);
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this plate?")) return;
    start(async () => {
      await deletePlate(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-rule rounded-md border border-rule bg-bg-alt">
        {order.map((id, i) => {
          const p = byId.get(id);
          if (!p) return null;
          return (
            <li key={id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-2 py-1 text-base leading-none text-muted hover:text-fg-soft disabled:opacity-30">▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="px-2 py-1 text-base leading-none text-muted hover:text-fg-soft disabled:opacity-30">▼</button>
                </div>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-rule bg-bg-alt">
                  {p.image && <Image src={p.image.url} alt="" fill className="object-contain" sizes="48px" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="truncate text-xs text-muted">
                    {[p.region, p.dateText].filter(Boolean).join(" · ")}
                  </div>
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
                  <PlateForm
                    action={updatePlate}
                    publicationId={publicationId}
                    defaults={p}
                    library={library}
                    onDone={done}
                  />
                </div>
              )}
            </li>
          );
        })}
        {order.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">No plates yet.</li>}
      </ul>

      {adding ? (
        <PlateForm action={addPlate} publicationId={publicationId} library={library} onDone={done} submitLabel="Add plate" />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md border border-rule px-3 py-1.5 text-sm hover:bg-bg-alt"
        >
          + Add plate
        </button>
      )}
    </div>
  );
}
