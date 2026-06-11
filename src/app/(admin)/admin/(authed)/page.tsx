import Link from "next/link";
import { adminDashboardCounts } from "@/lib/queries/admin";
import { PageHeader } from "@/components/admin/ui";

const CARDS = [
  { key: "publications", label: "Publications", href: "/admin/publications", live: "/publications" },
  { key: "films", label: "Films", href: "/admin/films", live: "/about#contact" },
  { key: "press", label: "Press", href: "/admin/press", live: "/press" },
  { key: "exhibitions", label: "Exhibitions", href: "/admin/exhibitions", live: "/exhibitions" },
  { key: "timeline", label: "Chronology", href: "/admin/about/chronology", live: "/about" },
  { key: "affiliations", label: "Affiliations", href: "/admin/about/affiliations", live: "/about" },
  { key: "media", label: "Media", href: "/admin/media", live: null },
] as const;

export default async function AdminDashboard() {
  const counts = await adminDashboardCounts();

  return (
    <div>
      <PageHeader title="Dashboard" description="Manage everything the public site renders." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-lg border border-rule bg-bg-alt p-5">
            <div className="text-3xl font-semibold tabular-nums">{counts[c.key]}</div>
            <div className="mt-1 text-sm text-muted">{c.label}</div>
            <div className="mt-4 flex gap-3 text-sm">
              <Link href={c.href} className="font-medium text-fg hover:underline">
                Manage
              </Link>
              {c.live && (
                <Link href={c.live} target="_blank" className="text-muted hover:underline">
                  View live ↗
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-rule bg-bg-alt p-5">
        <h2 className="text-sm font-semibold">Quick edit</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/publications/new" className="rounded-md bg-fg px-3 py-1.5 text-bg hover:bg-terra">
            + New publication
          </Link>
          <Link href="/admin/films/new" className="rounded-md border border-rule px-3 py-1.5 hover:bg-bg-alt">
            + New film
          </Link>
          <Link href="/admin/press/new" className="rounded-md border border-rule px-3 py-1.5 hover:bg-bg-alt">
            + New press item
          </Link>
          <Link href="/admin/exhibitions/new" className="rounded-md border border-rule px-3 py-1.5 hover:bg-bg-alt">
            + New exhibition
          </Link>
          <Link href="/admin/about" className="rounded-md border border-rule px-3 py-1.5 hover:bg-bg-alt">
            Edit bio
          </Link>
          <Link href="/admin/settings" className="rounded-md border border-rule px-3 py-1.5 hover:bg-bg-alt">
            Edit contact
          </Link>
        </div>
      </div>
    </div>
  );
}
