import { createFilm } from "@/lib/actions/films";
import { PageHeader } from "@/components/admin/ui";
import FilmForm from "@/components/admin/FilmForm";

export default function NewFilmPage() {
  return (
    <div>
      <PageHeader title="New film" />
      <FilmForm action={createFilm} mode="create" />
    </div>
  );
}
