import type { Metadata } from "next";
import Link from "next/link";
import { getFilms } from "@/lib/queries/content";
import { slugify } from "@/lib/format";

export const metadata: Metadata = {
  title: "Films",
  description:
    "Short films by Kevin Conru on the arts of Oceania — including the William Oldman collection and Ontong Java.",
};

export default async function FilmsPage() {
  const films = await getFilms();

  return (
    <main className="page">
      <div className="wrap">
        <header className="pubs-head">
          <h1 className="display">Films</h1>
          <p className="intro">
            Short films and moving-image works on the arts of Oceania — curatorial projects,
            collection studies and field records.
          </p>
        </header>

        {films.length > 0 ? (
          <div className="films-grid">
            {films.map((f) =>
              f.youtubeId ? (
                <Link key={f.id} className="film-card" href={`/films/${slugify(f.title)}`}>
                  <div className="film-still">
                    <div
                      className="film-thumb"
                      style={{
                        backgroundImage: `url('https://img.youtube.com/vi/${f.youtubeId}/maxresdefault.jpg')`,
                      }}
                    />
                  </div>
                  <div className="film-card-meta">
                    <h3>{f.title}</h3>
                    <span className="cap">{f.year}</span>
                  </div>
                </Link>
              ) : (
                <div key={f.id} className="film-card">
                  <div className="film-still film-still--soon">Coming soon</div>
                  <div className="film-card-meta">
                    <h3>{f.title}</h3>
                    <span className="cap">{f.year}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="intro">No films published yet.</p>
        )}
      </div>
    </main>
  );
}
