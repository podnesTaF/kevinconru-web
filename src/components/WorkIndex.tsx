import type { ReactNode } from "react";

// Shared index shell for the work entities — page frame + editorial header.
// The caller supplies the grid of cards as children (publications use
// .pubs-grid + PublicationCard; press/exhibitions use .press-grid + WorkCard).
export default function WorkIndex({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="page">
      <div className="wrap">
        <header className="pubs-head">
          <h1 className="display">{title}</h1>
          <p className="intro">{intro}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
