"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { logout } from "@/lib/actions/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/films", label: "Films" },
  { href: "/admin/press", label: "Press" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/about/chronology", label: "Chronology" },
  { href: "/admin/about/affiliations", label: "Affiliations" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/media", label: "Media" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          className={cn(
            "block rounded-md px-3 py-2.5 text-[15px] md:py-2 md:text-sm",
            active(l.href, l.exact) ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-100",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

function FooterLinks({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  return (
    <div className="space-y-1 border-t border-zinc-200 px-3 py-4">
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="block rounded-md px-3 py-2.5 text-[15px] text-zinc-700 hover:bg-zinc-100 md:py-2 md:text-sm"
      >
        View site ↗
      </Link>
      <form action={logout}>
        <button type="submit" className="w-full rounded-md px-3 py-2.5 text-left text-[15px] text-zinc-700 hover:bg-zinc-100 md:py-2 md:text-sm">
          Sign out
        </button>
      </form>
      <div className="truncate px-3 pt-2 text-xs text-zinc-400" title={email}>
        {email}
      </div>
    </div>
  );
}

export default function AdminSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="text-sm font-semibold tracking-tight">
          Kevin Conru — Admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 text-zinc-700"
        >
          <span className="relative block h-[2px] w-5 bg-current shadow-[0_-6px_0_currentColor,0_6px_0_currentColor]" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" onClick={close} className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <div className="text-sm font-semibold tracking-tight">Kevin Conru</div>
                <div className="text-xs text-zinc-500">Content admin</div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <NavLinks onNavigate={close} />
              <FooterLinks email={email} onNavigate={close} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-zinc-200 md:bg-white">
        <div className="border-b border-zinc-200 px-5 py-5">
          <div className="text-sm font-semibold tracking-tight">Kevin Conru</div>
          <div className="text-xs text-zinc-500">Content admin</div>
        </div>
        <NavLinks />
        <FooterLinks email={email} />
      </aside>
    </>
  );
}
