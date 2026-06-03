import { ArrowRight } from "@/components/icons";

// Inline PDF viewer + open/download link. Objects are served from the public
// GCS bucket, so a plain <iframe> renders in the browser's native viewer.
export default function PdfEmbed({ url, title }: { url: string; title?: string }) {
  return (
    <div className="pdf-embed">
      <iframe src={`${url}#view=FitH`} title={title ?? "PDF document"} className="pdf-frame" />
      <a className="link-arrow" href={url} target="_blank" rel="noopener noreferrer">
        Open / download PDF <ArrowRight />
      </a>
    </div>
  );
}
