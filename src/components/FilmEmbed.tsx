"use client";

import { useState } from "react";

export type FilmPlayerView = {
  title: string;
  youtubeId: string;
  startSeconds: number | null;
};

// YouTube facade: poster thumbnail → swaps to an autoplaying iframe on click.
// Player only — title/intro are rendered by the film detail page around it.
export default function FilmEmbed({ film }: { film: FilmPlayerView }) {
  const [play, setPlay] = useState(false);

  const src =
    `https://www.youtube.com/embed/${film.youtubeId}?rel=0&modestbranding=1` +
    (film.startSeconds ? `&start=${film.startSeconds}` : "") +
    (play ? "&autoplay=1" : "");

  return (
    <div className="film-frame">
      {play ? (
        <iframe
          src={src}
          title={film.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="film-poster"
          onClick={() => setPlay(true)}
          aria-label={`Play ${film.title}`}
          style={{
            backgroundImage: `url('https://img.youtube.com/vi/${film.youtubeId}/maxresdefault.jpg')`,
          }}
        >
          <span className="film-play" aria-hidden="true">
            ▶
          </span>
        </button>
      )}
    </div>
  );
}
