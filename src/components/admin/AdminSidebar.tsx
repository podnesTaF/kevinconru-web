"use client";

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

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-5">
        <div className="text-sm font-semibold tracking-tight">Kevin Conru</div>
        <div className="text-xs text-zinc-500">Content admin</div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm",
              active(l.href, l.exact)
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-100",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-zinc-200 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          View site ↗
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Sign out
          </button>
        </form>
        <div className="truncate px-3 pt-2 text-xs text-zinc-400" title={email}>
          {email}
        </div>
      </div>
    </aside>
  );
}
