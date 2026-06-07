import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFilms, getFilmBySlug } from "@/lib/queries/content";
import { slugify } from "@/lib/format";
import { ArrowRight } from "@/components/icons";
import RichText from "@/components/RichText";
import FilmEmbed from "@/components/FilmEmbed";

// Prerender published films. Resilient: if the DB is unreachable at build
// time, fall back to on-demand rendering instead of failing the build.
export async function generateStaticParams() {
  try {
    const films = await getFilms();
    return films.filter((f) => f.youtubeId).map((f) => ({ slug: slugify(f.title) }));
  } catch {
    return [];
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) return {};
  return {
    title: film.title,
    description: stripHtml(film.intro).slice(0, 160) || `${film.title}, ${film.year}`,
  };
}

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film || !film.youtubeId) notFound();

  return (
    <main className="page">
      <div className="wrap pd">
        <Link className="pd-crumb" href="/films">
          ← Films
        </Link>

        <header style={{ marginBottom: "clamp(28px, 5vw, 44px)" }}>
          <span className="eyebrow">Film · {film.year}</span>
          <h1 className="pd-title" style={{ marginTop: 14, marginBottom: 0 }}>
            {film.title}
          </h1>
        </header>

        <FilmEmbed
          film={{ title: film.title, youtubeId: film.youtubeId, startSeconds: film.startSeconds }}
        />

        {stripHtml(film.intro).length > 0 && (
          <div className="measure" style={{ marginTop: "clamp(28px, 5vw, 44px)" }}>
            <RichText html={film.intro} className="pd-body" />
          </div>
        )}

        <div style={{ marginTop: "clamp(40px, 7vw, 64px)" }}>
          <Link className="link-arrow" href="/films">
            All films <ArrowRight />
          </Link>
        </div>
      </div>
    </main>
  );
}
