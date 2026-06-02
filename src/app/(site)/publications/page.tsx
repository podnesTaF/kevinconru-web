import type { Metadata } from "next";
import { getPublications } from "@/lib/queries/publications";
import PublicationsBrowser from "@/components/PublicationsBrowser";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Catalogues, monographs and archives published over four decades on the arts of Oceania and Sub-Saharan Africa.",
};

// Static route: the full published list is prerendered (so it's fully prefetched
// and navigates instantly). Region filtering happens client-side in
// PublicationsBrowser, so reading searchParams here — which would force dynamic
// rendering — is intentionally avoided.
export default async function PublicationsPage() {
  const pubs = await getPublications();

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

        <PublicationsBrowser pubs={pubs} />
      </div>
    </main>
  );
}
