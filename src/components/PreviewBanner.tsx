import Link from "next/link";

// Floating bar pinned to the bottom of an admin preview, clear of the site Nav.
// Signals that this page is a private preview (and whether it is live yet) and
// links straight back to the editor.
export default function PreviewBanner({
  published,
  editHref,
  label,
}: {
  published: boolean;
  editHref: string;
  label: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-fg px-4 py-2.5 text-center text-sm text-bg shadow-lg">
      <span>
        <strong className="font-medium">Preview</strong>
        {" — "}
        {published ? "published · live on the site" : "draft · not yet public"}
        {label && <span className="text-bg/70"> · {label}</span>}
      </span>
      <Link href={editHref} className="font-medium underline underline-offset-2 hover:text-terra">
        Back to editor
      </Link>
    </div>
  );
}
