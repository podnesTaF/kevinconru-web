"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Dark hero plate that cross-fades the two New Ireland object photos every 7s,
// with the plate-info caption. Honors prefers-reduced-motion (holds frame 1).
const OBJECTS = [
  { url: "/seed/object-mask.jpg", plate: "173" },
  { url: "/seed/object-headdress.jpg", plate: "124" },
];

export default function HeroPlate() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % OBJECTS.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-photo">
      {OBJECTS.map((o, i) => (
        <Image
          key={o.url}
          src={o.url}
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
        <span>Plate № {OBJECTS[active].plate}</span>
        <span>New Ireland · c. 1890</span>
      </div>
    </div>
  );
}
