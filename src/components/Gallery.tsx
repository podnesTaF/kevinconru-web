"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type GalleryView = {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  width?: number | null;
  height?: number | null;
};

// Gallery + full-screen lightbox in one client island. Three layouts:
// - "grid": two-column tiles at each image's natural ratio — bare, frameless.
// - "list": full-width page-by-page flow — for journal / article scans where
//   reading line by line beats an embedded PDF viewer.
// - "covers": uniform 3:4 cover cards, identical to the publications index
//   (cover-cropped photo, bottom scrim label) so the row aligns perfectly.
// All open the same minimal lightbox (arrows, swipe, Esc / ← / → keys).
// `reveal` tags tiles for the ScrollReveal island (staggered rise-in).
export default function Gallery({
  items,
  layout = "grid",
  reveal = false,
}: {
  items: GalleryView[];
  layout?: "grid" | "list" | "covers";
  reveal?: boolean;
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

  // Staggered scroll-reveal attributes (capped so late tiles never lag).
  const revealProps = (i: number) =>
    reveal
      ? {
          "data-reveal": "zoom",
          style: { "--rv-delay": `${Math.min(i, 5) * 70}ms` } as React.CSSProperties,
        }
      : {};

  const figure = (it: GalleryView, i: number, className: string) => (
    <figure key={it.id} className={className} {...revealProps(i)}>
      <button type="button" onClick={() => setIndex(i)} aria-label={`Open image ${i + 1} of ${items.length}`}>
        {/* width/height (when known) reserve the space before load, so the
            layout never jumps; grid plates contain the image uncropped. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={it.imageUrl}
          alt={it.title ?? ""}
          width={it.width ?? undefined}
          height={it.height ?? undefined}
          loading={i > 1 ? "lazy" : undefined}
        />
      </button>
      {(it.title || it.caption) && (
        <figcaption>
          {it.title && <strong>{it.title}</strong>}
          {it.caption && <span>{it.caption}</span>}
        </figcaption>
      )}
    </figure>
  );

  return (
    <>
      {layout === "list" ? (
        <div className="gallery-list">{items.map((it, i) => figure(it, i, "gallery-page"))}</div>
      ) : layout === "covers" ? (
        <div className="pubs-grid">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className="pub-card"
              onClick={() => setIndex(i)}
              aria-label={`Open image ${i + 1} of ${items.length}`}
              {...revealProps(i)}
            >
              <div className="pub-cover pub-cover--photo">
                <div className="pc-photo" style={{ backgroundImage: `url('${it.imageUrl}')` }} />
                <div className="pc-overlay">
                  {it.title && <span className="pc-title">{it.title}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="gallery-grid">{items.map((it, i) => figure(it, i, "gallery-item"))}</div>
      )}

      {open &&
        createPortal(
          <div className="lb" role="dialog" aria-modal="true" aria-label="Image viewer">
            {item && (
              <>
                <button className="lb-x" onClick={close} aria-label="Close">
                  ×
                </button>
                <div className="lb-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
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
                <div className="lb-cap">
                  {items.length > 1 && (
                    <span className="lb-count">
                      {index! + 1} / {items.length}
                    </span>
                  )}
                  {item.title && <strong>{item.title}</strong>}
                  {item.title && item.caption && " — "}
                  {item.caption}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
