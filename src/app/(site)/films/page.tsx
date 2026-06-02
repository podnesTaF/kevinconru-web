import type { Metadata } from "next";
import { getFilms } from "@/lib/queries/content";
import FilmEmbed from "@/components/FilmEmbed";

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
            {films.map((f) => (
              <FilmEmbed
                key={f.id}
                film={{
                  id: f.id,
                  title: f.title,
                  year: f.year,
                  youtubeId: f.youtubeId,
                  startSeconds: f.startSeconds,
                  intro: f.intro,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="intro">No films published yet.</p>
        )}
      </div>
    </main>
  );
}
