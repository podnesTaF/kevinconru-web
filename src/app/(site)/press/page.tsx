import type { Metadata } from "next";
import { getPressItems } from "@/lib/queries/content";

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
          <section className="ab-cv">
            <div>
              {press.map((p) => {
                const href = p.file?.url ?? p.url;
                return (
                  <div key={p.id} className="cv-row">
                    <span className="yr">{p.year}</span>
                    <span className="ev">
                      <em>{p.title}</em>
                      <span className="desc">
                        {p.outlet}
                        {href && (
                          <>
                            {" · "}
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ borderBottom: "1px solid var(--rule)" }}
                            >
                              {p.file ? "Read the insert" : "Read"} ↗
                            </a>
                          </>
                        )}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="intro">No press items published yet.</p>
        )}
      </div>
    </main>
  );
}
