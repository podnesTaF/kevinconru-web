"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export type GalleryView = {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

// Grid gallery + full-screen lightbox in one client island. Click to open;
// Esc / ← / → to navigate. Each image carries light meta (title + caption).
export default function Gallery({ items }: { items: GalleryView[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const nav = useCallback(
    (delta: number) => setIndex((v) => (v === null ? v : (v + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") nav(1);
      else if (e.key === "ArrowLeft") nav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, nav]);

  const item = open ? items[index] : null;

  return (
    <>
      <div className="pd-plates">
        {items.map((it, i) => (
          <button key={it.id} type="button" className="plate-card" onClick={() => setIndex(i)}>
            <div className="plate">
              <span className="plate-num">№ {pad(i + 1)}</span>
              <Image src={it.imageUrl} alt={it.title ?? ""} fill sizes="(max-width: 720px) 100vw, 50vw" />
            </div>
            {(it.title || it.caption) && (
              <div className="plate-cap">
                <span className="num">№ {pad(i + 1)}</span>
                <div className="body">
                  {it.title && <h4>{it.title}</h4>}
                  {it.caption && <p>{it.caption}</p>}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {open &&
        createPortal(
          <div className="lb is-open">
            {item && (
              <>
                <div className="lb-hd">
                  <span>
                    № {pad(index! + 1)} / {pad(items.length)}
                  </span>
                  <button className="lb-x" onClick={close} aria-label="Close">
                    ×
                  </button>
                </div>
                <div className="lb-stage">
                  <div className="lb-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title ?? ""} />
                  </div>
                  {(item.title || item.caption) && (
                    <div className="lb-side">
                      {item.title && <h4 className="display">{item.title}</h4>}
                      {item.caption && <p>{item.caption}</p>}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
