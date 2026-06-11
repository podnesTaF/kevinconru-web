import type { Metadata } from "next";
import { getExhibitions } from "@/lib/queries/exhibitions";
import WorkIndex from "@/components/WorkIndex";
import WorkCard from "@/components/WorkCard";

export const metadata: Metadata = {
  title: "Exhibitions",
  description:
    "Exhibitions of African and Oceanic art curated by or featuring the collections and publications of Kevin Conru.",
};

export default async function ExhibitionsPage() {
  const exhibitions = await getExhibitions();

  return (
    <WorkIndex
      title="Exhibitions"
      intro="Curatorial projects and exhibitions of African and Oceanic art, held in Brussels, Rotterdam and beyond."
    >
      {exhibitions.length > 0 ? (
        <div className="press-grid">
          {exhibitions.map((e, i) => (
            <WorkCard
              key={e.id}
              publicBase="/exhibitions"
              index={i}
              item={{
                slug: e.slug,
                title: e.title,
                subtitle: e.subtitle,
                coverImage: e.coverImage,
                meta: e.venue,
                year: e.year,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="intro">No exhibitions published yet.</p>
      )}
    </WorkIndex>
  );
}
