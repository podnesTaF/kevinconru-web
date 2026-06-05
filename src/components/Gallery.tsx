"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export type GalleryView = {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

// Gallery + full-screen lightbox in one client island. Two layouts:
// - "grid": thumbnail grid (object plates) — the default.
// - "list": full-width page-by-page flow, like the old site — for journal /
//   article scans where reading line by line beats an embedded PDF viewer.
// Both open the same lightbox (arrows, swipe, Esc / ← / → keys).
export default function Gallery({
  items,
  layout = "grid",
}: {
  items: GalleryView[];
  layout?: "grid" | "list";
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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

  // Horizontal swipe → prev/next (the only viable gesture on phones).
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) nav(dx < 0 ? 1 : -1);
  };

  const item = open ? items[index] : null;

  return (
    <>
      {layout === "list" ? (
        <div className="gallery-list">
          {items.map((it, i) => (
            <figure key={it.id} className="gallery-page">
              <button type="button" onClick={() => setIndex(i)} aria-label={`Open image ${i + 1} of ${items.length}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.imageUrl} alt={it.title ?? ""} loading={i > 1 ? "lazy" : undefined} />
              </button>
              {(it.title || it.caption) && (
                <figcaption>
                  {it.title && <strong>{it.title}</strong>}
                  {it.caption && <span>{it.caption}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
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
      )}

      {open &&
        createPortal(
          <div className="lb is-open" role="dialog" aria-modal="true" aria-label="Image viewer">
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
                  <div className="lb-img" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title ?? ""} />
                    {items.length > 1 && (
                      <>
                        <button className="lb-nav lb-prev" onClick={() => nav(-1)} aria-label="Previous image">
                          ←
                        </button>
                        <button className="lb-nav lb-next" onClick={() => nav(1)} aria-label="Next image">
                          →
                        </button>
                      </>
                    )}
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
