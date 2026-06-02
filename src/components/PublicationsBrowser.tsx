"use client";

import { useEffect, useState } from "react";
import type { Media, Publication } from "@/generated/prisma/client";
import { isRegionFilter, regionsForFilter, type RegionFilterValue } from "@/lib/format";
import PublicationCard from "@/components/PublicationCard";
import RegionFilter from "@/components/RegionFilter";

type PubWithCover = Publication & { coverImage: Media | null };

// Client-side region filtering over the full (statically prerendered) list.
// Keeping the filter on the client lets /publications stay a static, fully
// prefetched route — navigation is instant and filtering needs no server trip.
export default function PublicationsBrowser({ pubs }: { pubs: PubWithCover[] }) {
  const [filter, setFilter] = useState<RegionFilterValue>("All");

  // Adopt a shareable `?region=` deep link on mount (URL stays the source of
  // truth for sharing); SSR renders "All" so the static HTML has every card.
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("region") ?? undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isRegionFilter(r)) setFilter(r);
  }, []);

  const select = (r: RegionFilterValue) => {
    setFilter(r);
    const url = r === "All" ? window.location.pathname : `${window.location.pathname}?region=${r}`;
    // Update the URL without a navigation/server round-trip.
    window.history.replaceState(null, "", url);
  };

  const regions = regionsForFilter(filter);
  const filtered = regions ? pubs.filter((p) => regions.includes(p.region)) : pubs;

  return (
    <>
      <RegionFilter active={filter} count={filtered.length} onSelect={select} />
      <div className="pubs-grid">
        {filtered.map((pub, i) => (
          <PublicationCard key={pub.id} pub={pub} index={i} />
        ))}
      </div>
    </>
  );
}
