import { ArrowRight } from "@/components/icons";

const fmtSize = (bytes?: number | null) => {
  if (!bytes) return null;
  const mb = bytes / 1024 / 1024;
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
};

// Inline PDF viewer (desktop) + an always-available open action. Phones can't
// scroll an embedded PDF (iOS shows only the first page, many Android browsers
// download instead), so the iframe is hidden ≤820px via CSS and the document
// card is the primary affordance there.
export default function PdfEmbed({
  url,
  title,
  bytes,
}: {
  url: string;
  title?: string;
  bytes?: number | null;
}) {
  const size = fmtSize(bytes);
  return (
    <div className="pdf-embed">
      <iframe src={`${url}#view=FitH`} title={title ?? "PDF document"} className="pdf-frame" />
      <a className="pdf-open" href={url} target="_blank" rel="noopener noreferrer">
        <span className="pdf-open-badge" aria-hidden="true">
          PDF
        </span>
        <span className="pdf-open-label">
          <strong>{title ?? "Open the document"}</strong>
          <span>
            Opens in your device&apos;s PDF viewer
            {size ? ` · ${size}` : ""}
          </span>
        </span>
        <ArrowRight />
      </a>
    </div>
  );
}
