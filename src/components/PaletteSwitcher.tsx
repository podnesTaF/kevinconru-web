"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Palette = "bone" | "sage" | "ink";

const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: "bone", label: "Bone", swatch: "#efeadd" },
  { id: "sage", label: "Sage", swatch: "#b3b89f" },
  { id: "ink", label: "Ink", swatch: "#1c1a17" },
];

const STORAGE_KEY = "palette";

export default function PaletteSwitcher() {
  // The inline script in the root layout sets dataset.palette before paint;
  // sync to it on mount (default "bone" during SSR to match the markup).
  const [palette, setPalette] = useState<Palette>("bone");

  useEffect(() => {
    // SSR renders the default ("bone"); after mount, adopt whatever the
    // no-flash script restored from localStorage. Intentional one-time sync.
    const current = document.documentElement.dataset.palette as Palette | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (current) setPalette(current);
  }, []);

  const choose = (next: Palette) => {
    setPalette(next);
    // Driving the <html data-palette> attribute IS this component's purpose.
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.dataset.palette = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore unavailable storage */
    }
  };

  return (
    <div className="palette-switch" role="radiogroup" aria-label="Color palette">
      <span className="lab">Palette</span>
      {PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={palette === p.id}
          aria-label={p.label}
          title={p.label}
          className={cn("palette-dot", palette === p.id && "is-active")}
          style={{ background: p.swatch }}
          onClick={() => choose(p.id)}
        />
      ))}
    </div>
  );
}
