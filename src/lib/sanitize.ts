import "server-only";
import sanitize from "sanitize-html";

// Sanitize admin-authored rich text on write. The TipTap editor (StarterKit +
// Link) already constrains output, but Server Actions are reachable as raw
// POSTs, so we re-clean to an allow-list of the tags the editor can emit. The
// stored HTML is later rendered with dangerouslySetInnerHTML (see RichText).
//
// sanitize-html is a pure htmlparser2-based cleaner — unlike the previous
// isomorphic-dompurify it pulls no jsdom into the server bundle (jsdom 29's
// CJS require() of the ESM-only @exodus/bytes crashed Vercel lambdas with
// ERR_REQUIRE_ESM).
const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "s", "u", "code", "pre",
    "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a",
    // Inline images (TipTap image node) so a body can mix text + images freely.
    "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height"],
  },
  // Only safe absolute protocols; relative URLs and #fragments stay allowed.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
};

export function sanitizeHtml(html: string): string {
  return sanitize(html, OPTIONS);
}
