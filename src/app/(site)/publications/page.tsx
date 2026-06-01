import type { Metadata } from "next";
import { getPublications } from "@/lib/queries/publications";
import { isRegionFilter } from "@/lib/format";
import PublicationCard from "@/components/PublicationCard";
import RegionFilter from "@/components/RegionFilter";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Catalogues, monographs and archives published over four decades on the arts of Oceania and Sub-Saharan Africa.",
};

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const filter = isRegionFilter(region) ? region : "All";
  const pubs = await getPublications(filter);

  return (
    <main className="page">
      <div className="wrap">
        <header className="pubs-head">
          <h1 className="display">Publications</h1>
          <p className="intro">
            Catalogues, monographs and archives — published over four decades on the arts of Oceania
            and Sub-Saharan Africa. Many accompany exhibitions held in Brussels, Rotterdam and beyond.
          </p>
        </header>

        <RegionFilter active={filter} count={pubs.length} />

        <div className="pubs-grid">
          {pubs.map((pub, i) => (
            <PublicationCard key={pub.id} pub={pub} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
