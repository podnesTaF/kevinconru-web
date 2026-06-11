import type { Metadata } from "next";
import { getPressItems } from "@/lib/queries/content";
import WorkIndex from "@/components/WorkIndex";
import WorkCard from "@/components/WorkCard";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Press features, exhibition coverage and inserts on the publications and exhibitions of Kevin Conru.",
};

export default async function PressPage() {
  const press = await getPressItems();

  return (
    <WorkIndex
      title="Press"
      intro="Features, exhibition coverage and inserts accompanying the publications and curatorial projects."
    >
      {press.length > 0 ? (
        <div className="press-grid">
          {press.map((p, i) => (
            <WorkCard
              key={p.id}
              publicBase="/press"
              index={i}
              item={{
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                coverImage: p.coverImage,
                meta: p.outlet,
                year: p.year,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="intro">No press items published yet.</p>
      )}
    </WorkIndex>
  );
}
