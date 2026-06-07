"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reveals [data-reveal] elements as they enter the viewport (adds .is-inview,
// styled in globals.css). The hidden pre-reveal state only applies under
// html.anim-ready — set here at runtime — so content is never hidden when JS
// is unavailable, and never for visitors who prefer reduced motion.
// Re-scans on every route change (the island lives in the site layout).
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("anim-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        }
      },
      // Trigger slightly before the element clears the fold so the rise is
      // already underway as it scrolls into view.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    document.querySelectorAll("[data-reveal]:not(.is-inview)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
