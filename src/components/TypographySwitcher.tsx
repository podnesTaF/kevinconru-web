"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type TypePair = "editorial" | "modern" | "literary";

const PAIRINGS: { id: TypePair; label: string }[] = [
  { id: "editorial", label: "Editorial" },
  { id: "modern", label: "Modern" },
  { id: "literary", label: "Literary" },
];

const STORAGE_KEY = "typepair";

export default function TypographySwitcher() {
  // SSR renders the default ("modern"); the no-flash script in the root layout
  // applies any saved choice before paint, and we sync to it on mount.
  const [pair, setPair] = useState<TypePair>("modern");

  useEffect(() => {
    const current = document.documentElement.dataset.typepair as TypePair | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (current) setPair(current);
  }, []);

  const choose = (next: TypePair) => {
    setPair(next);
    // Driving the <html data-typepair> attribute IS this component's purpose.
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.dataset.typepair = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore unavailable storage */
    }
  };

  return (
    <div className="type-switch" role="radiogroup" aria-label="Typography">
      <span className="lab">Type</span>
      {PAIRINGS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={pair === p.id}
          className={cn("type-opt", pair === p.id && "is-active")}
          onClick={() => choose(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
