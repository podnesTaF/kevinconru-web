import type { Metadata } from "next";
import { getPublications } from "@/lib/queries/publications";
import WorkIndex from "@/components/WorkIndex";
import PublicationCard from "@/components/PublicationCard";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Catalogues, monographs and archives published over four decades on the arts of Oceania and Sub-Saharan Africa.",
};

// Static route: the full published list is prerendered (fully prefetched, so it
// navigates instantly).
export default async function PublicationsPage() {
  const pubs = await getPublications();

  return (
    <WorkIndex
      title="Publications"
      intro="Catalogues, monographs and archives — published over four decades on the arts of Oceania and Sub-Saharan Africa. Many accompany exhibitions held in Brussels, Rotterdam and beyond."
    >
      <div className="pubs-grid">
        {pubs.map((pub, i) => (
          <PublicationCard key={pub.id} pub={pub} index={i} />
        ))}
      </div>
    </WorkIndex>
  );
}
