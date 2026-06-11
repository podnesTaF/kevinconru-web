"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // Publications stays active on its detail routes too.
  return pathname === href || pathname.startsWith(href + "/");
}

const SCROLL_ON = 72;
const SCROLL_OFF = 24;

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y >= SCROLL_ON) return true;
        if (prev && y <= SCROLL_OFF) return false;
        return prev;
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = isHome && !scrolled;

  return (
    <>
      <nav className={cn("nav", overlay && "nav--overlay", scrolled && "is-scrolled")}>
        <Link className="nav-brand" href="/">
          <span className="mark" aria-hidden="true" />
          <span>CONRU</span>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("nav-link", isActive(pathname, l.href) && "is-active")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link className="nav-cta" href="/about#contact">
          Get in touch
        </Link>

        <button
          className="nav-mobile-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <span />
        </button>
      </nav>

      {mobileOpen && (
        <div className="nav-mobile-sheet">
          <button
            className="nav-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("nav-link", isActive(pathname, l.href) && "is-active")}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
