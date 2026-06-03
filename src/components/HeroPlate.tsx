"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Dark hero plate that slowly cross-fades a selection of object photos every 7s,
// with the plate-info caption. Honors prefers-reduced-motion (holds frame 1).
const OBJECTS = [
  "/objects/object-1.jpeg",
  "/objects/object-2.jpeg",
  "/objects/object-3.jpeg",
  "/objects/object-4.jpeg",
  "/objects/object-5.jpeg",
  "/objects/object-6.jpeg",
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function HeroPlate() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % OBJECTS.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-photo">
      {OBJECTS.map((url, i) => (
        <Image
          key={url}
          src={url}
          alt=""
          fill
          priority={i === 0}
          sizes="(max-width: 900px) 100vw, 45vw"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.6s cubic-bezier(.2,.7,.2,1)",
          }}
        />
      ))}
      <div className="plate-info">
        <span>Selected work № {pad(active + 1)}</span>
        <span>African &amp; Oceanic art</span>
      </div>
    </div>
  );
}
