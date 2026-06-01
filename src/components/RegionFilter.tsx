"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { REGION_FILTERS, type RegionFilterValue } from "@/lib/format";

// Region pills for the Publications index. Drives a shareable `?region=` URL;
// the server re-queries on navigation (filtering stays authoritative server-side).
export default function RegionFilter({
  active,
  count,
}: {
  active: RegionFilterValue;
  count: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const select = (r: RegionFilterValue) => {
    const href = r === "All" ? pathname : `${pathname}?region=${r}`;
    router.push(href, { scroll: false });
  };

  return (
    <div className="pubs-toolbar">
      <span>
        {count} {count === 1 ? "title" : "titles"}
      </span>
      <div className="pubs-filters" role="group" aria-label="Filter by region">
        {REGION_FILTERS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={active === r}
            className={cn("pubs-filter", active === r && "is-active")}
            onClick={() => select(r)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
