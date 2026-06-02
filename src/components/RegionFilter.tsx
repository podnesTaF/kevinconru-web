"use client";

import { cn } from "@/lib/cn";
import { REGION_FILTERS, type RegionFilterValue } from "@/lib/format";

// Region pills for the Publications index. Presentational — the parent owns the
// active filter and handles selection (client-side filtering, see
// PublicationsBrowser), so the page stays static and instant to navigate to.
export default function RegionFilter({
  active,
  count,
  onSelect,
}: {
  active: RegionFilterValue;
  count: number;
  onSelect: (r: RegionFilterValue) => void;
}) {
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
            onClick={() => onSelect(r)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
