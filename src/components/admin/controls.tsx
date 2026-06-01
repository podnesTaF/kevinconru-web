"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

// Optimistic on/off switch backed by a direct server action (id, value).
export function Toggle({
  id,
  value,
  action,
  labels = ["On", "Off"],
}: {
  id: string;
  value: boolean;
  action: (id: string, value: boolean) => Promise<void>;
  labels?: [string, string];
}) {
  const [on, setOn] = useState(value);
  const [pending, start] = useTransition();
  const router = useRouter();

  const toggle = () => {
    const next = !on;
    setOn(next);
    start(async () => {
      try {
        await action(id, next);
        router.refresh();
      } catch {
        setOn(!next);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        on ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-500",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-green-600" : "bg-zinc-400")} />
      {on ? labels[0] : labels[1]}
    </button>
  );
}

// Confirm + run a (pre-bound) delete action.
export function DeleteButton({
  action,
  label = "Delete",
  confirm = "Delete this item? This cannot be undone.",
  className,
}: {
  action: () => Promise<unknown>;
  label?: string;
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirm)) return;
        start(async () => {
          await action();
          router.refresh();
        });
      }}
      className={cn("text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50", className)}
    >
      {pending ? "…" : label}
    </button>
  );
}

// Up/down reorder list. The page renders each row's content (server-side) and
// passes it in; reordering posts the new id order to a reorder action.
export function ReorderList({
  items,
  action,
}: {
  items: { id: string; content: React.ReactNode }[];
  action: (ids: string[]) => Promise<void>;
}) {
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [pending, start] = useTransition();
  const router = useRouter();

  const byId = new Map(items.map((i) => [i.id, i.content]));

  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    start(async () => {
      await action(next);
      router.refresh();
    });
  };

  return (
    <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white">
      {order.map((id, i) => (
        <li key={id} className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0 || pending}
              aria-label="Move up"
              className="px-2 py-1 text-base leading-none text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === order.length - 1 || pending}
              aria-label="Move down"
              className="px-2 py-1 text-base leading-none text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
            >
              ▼
            </button>
          </div>
          <div className="min-w-0 flex-1">{byId.get(id)}</div>
        </li>
      ))}
    </ul>
  );
}
