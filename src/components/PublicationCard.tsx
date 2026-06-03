import Link from "next/link";
import type { Media, Publication } from "@/generated/prisma/client";
import PubCover from "@/components/PubCover";

type PubWithCover = Publication & { coverImage: Media | null };

// Index grid item: cover + title/subtitle/year, hover lift (CSS).
export default function PublicationCard({
  pub,
  index = 0,
}: {
  pub: PubWithCover;
  index?: number;
}) {
  return (
    <Link
      href={`/publications/${pub.slug}`}
      className="pub-card fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <PubCover pub={pub} />
    </Link>
  );
}
