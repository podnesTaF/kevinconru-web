"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export type PlateView = {
  id: string;
  title: string;
  region: string | null;
  dateText: string | null;
  materials: string | null;
  dimensions: string | null;
  provenance: string | null;
  caption: string | null;
  imageUrl: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

// Renders the "Selected plates" grid and the full-screen lightbox together so
// the click-to-open + keyboard nav (Esc / ← / →) live in one client island.
export default function PlatesGallery({ plates }: { plates: PlateView[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const nav = useCallback(
    (delta: number) => setIndex((v) => (v === null ? v : (v + delta + plates.length) % plates.length)),
    [plates.length],
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

  const plate = open ? plates[index] : null;

  return (
    <>
      <div className="pd-plates">
        {plates.map((pl, i) => (
          <button key={pl.id} type="button" className="plate-card" onClick={() => setIndex(i)}>
            <div className="plate">
              <span className="plate-num">№ {pad(i + 1)}</span>
              <Image src={pl.imageUrl} alt={pl.title} fill sizes="(max-width: 720px) 100vw, 50vw" />
            </div>
            <div className="plate-cap">
              <span className="num">№ {pad(i + 1)}</span>
              <div className="body">
                <h4>{pl.title}</h4>
                <p>
                  {[pl.region, pl.dateText].filter(Boolean).join(" · ")}
                  {pl.materials ? (
                    <>
                      <br />
                      {pl.materials}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className={"lb" + (open ? " is-open" : "")} aria-hidden={!open}>
        {plate && (
          <>
            <div className="lb-hd">
              <span>
                Plate № {pad(index! + 1)} / {pad(plates.length)}
              </span>
              <button className="lb-x" onClick={close} aria-label="Close">
                ×
              </button>
            </div>
            <div className="lb-stage">
              <div className="lb-img">
                {/* Full-size view — plain img (contain, no layout box). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={plate.imageUrl} alt={plate.title} />
              </div>
              <div className="lb-side">
                <h4 className="display">{plate.title}</h4>
                {plate.region && <p className="region">{plate.region}</p>}
                {plate.dateText && (
                  <>
                    <div className="lab">Date</div>
                    <p>{plate.dateText}</p>
                  </>
                )}
                {plate.materials && (
                  <>
                    <div className="lab">Materials</div>
                    <p>{plate.materials}</p>
                  </>
                )}
                {plate.dimensions && (
                  <>
                    <div className="lab">Dimensions</div>
                    <p>{plate.dimensions}</p>
                  </>
                )}
                {plate.provenance && (
                  <>
                    <div className="lab">Provenance</div>
                    <p>{plate.provenance}</p>
                  </>
                )}
                {plate.caption && (
                  <>
                    <div className="lab">Note</div>
                    <p>{plate.caption}</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
