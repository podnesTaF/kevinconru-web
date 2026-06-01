"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAffiliation,
  updateAffiliation,
  deleteAffiliation,
  reorderAffiliations,
} from "@/lib/actions/about";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";

export type Affiliation = { id: string; role: string; name: string; url: string | null };

function AffForm({
  action,
  defaults,
  onDone,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Partial<Affiliation>;
  onDone: () => void;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const fe = state.fieldErrors;
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Role</label>
          <input name="role" defaultValue={defaults?.role ?? ""} placeholder="Member / Advisor / MA" className={inputCls} />
          <FieldError errors={fe?.role} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Name</label>
          <input name="name" defaultValue={defaults?.name ?? ""} className={inputCls} />
          <FieldError errors={fe?.name} />
        </div>
      </div>
      <div>
        <label className={labelCls}>URL (optional)</label>
        <input name="url" defaultValue={defaults?.url ?? ""} placeholder="https://…" className={inputCls} />
        <FieldError errors={fe?.url} />
      </div>
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

export default function AffiliationsManager({ items }: { items: Affiliation[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [, start] = useTransition();
  const byId = new Map(items.map((i) => [i.id, i]));

  const done = () => {
    setEditing(null);
    setAdding(false);
    router.refresh();
  };
  const move = (i: number, d: number) => {
    const next = [...order];
    const t = i + d;
    if (t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t], next[i]];
    setOrder(next);
    start(async () => {
      await reorderAffiliations(next);
      router.refresh();
    });
  };
  const remove = (id: string) => {
    if (!window.confirm("Delete this affiliation?")) return;
    start(async () => {
      await deleteAffiliation(id);
      router.refresh();
    });
  };

  return (
    <div className="max-w-2xl space-y-3">
      <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white">
        {order.map((id, i) => {
          const a = byId.get(id);
          if (!a) return null;
          return (
            <li key={id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30">▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30">▼</button>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{a.role}</span> <span className="text-sm text-zinc-600">{a.name}</span>
                </div>
                <button type="button" onClick={() => setEditing(editing === id ? null : id)} className="text-xs font-medium text-zinc-700 hover:underline">
                  {editing === id ? "Close" : "Edit"}
                </button>
                <button type="button" onClick={() => remove(id)} className="text-xs font-medium text-red-600 hover:text-red-700">
                  Delete
                </button>
              </div>
              {editing === id && (
                <div className="mt-3">
                  <AffForm action={updateAffiliation} defaults={a} onDone={done} submitLabel="Save affiliation" />
                </div>
              )}
            </li>
          );
        })}
        {order.length === 0 && <li className="px-4 py-6 text-center text-sm text-zinc-400">No affiliations yet.</li>}
      </ul>

      {adding ? (
        <AffForm action={createAffiliation} onDone={done} submitLabel="Add affiliation" />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100">
          + Add affiliation
        </button>
      )}
    </div>
  );
}
