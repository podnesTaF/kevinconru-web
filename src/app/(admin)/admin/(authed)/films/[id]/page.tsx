import { notFound } from "next/navigation";
import { adminGetFilm } from "@/lib/queries/admin";
import { updateFilm } from "@/lib/actions/films";
import { PageHeader } from "@/components/admin/ui";
import FilmForm from "@/components/admin/FilmForm";

export default async function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const film = await adminGetFilm(id);
  if (!film) notFound();

  return (
    <div>
      <PageHeader title="Edit film" description={film.title} />
      <FilmForm
        action={updateFilm}
        mode="edit"
        defaults={{
          id: film.id,
          title: film.title,
          year: film.year,
          youtubeId: film.youtubeId,
          startSeconds: film.startSeconds,
          intro: film.intro,
          published: film.published,
        }}
      />
    </div>
  );
}
