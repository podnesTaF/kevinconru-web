import type { Metadata } from "next";
import { getPressItems } from "@/lib/queries/content";
import PressCard from "@/components/PressCard";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Press features, exhibition coverage and inserts on the publications and exhibitions of Kevin Conru.",
};

export default async function PressPage() {
  const press = await getPressItems();

  return (
    <main className="page">
      <div className="wrap">
        <header className="pubs-head">
          <h1 className="display">Press</h1>
          <p className="intro">
            Features, exhibition coverage and inserts accompanying the publications and curatorial
            projects.
          </p>
        </header>

        {press.length > 0 ? (
          <div className="press-grid">
            {press.map((p, i) => (
              <PressCard key={p.id} item={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="intro">No press items published yet.</p>
        )}
      </div>
    </main>
  );
}
