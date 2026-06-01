"use client";

import { useState } from "react";
import RichText from "@/components/RichText";

export type FilmView = {
  id: string;
  title: string;
  year: number;
  youtubeId: string | null;
  startSeconds: number | null;
  intro: string;
};

// YouTube facade: poster thumbnail → swaps to an autoplaying iframe on click.
// Null youtubeId renders a "coming soon" tile (per the prototype).
export default function FilmEmbed({ film }: { film: FilmView }) {
  const [play, setPlay] = useState(false);

  const src = film.youtubeId
    ? `https://www.youtube.com/embed/${film.youtubeId}?rel=0&modestbranding=1` +
      (film.startSeconds ? `&start=${film.startSeconds}` : "") +
      (play ? "&autoplay=1" : "")
    : null;

  return (
    <div className="film">
      <div className="film-frame">
        {src ? (
          play ? (
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
          )
        ) : (
          <div className="film-poster film-poster--soon">
            <span>Film · {film.year}</span>
          </div>
        )}
      </div>
      <div className="film-cap">
        <div className="film-meta">
          <span className="display film-title">{film.title}</span>
          <span className="cap">{film.year}</span>
        </div>
        <RichText html={film.intro} />
      </div>
    </div>
  );
}
