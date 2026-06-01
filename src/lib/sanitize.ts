import "server-only";
import DOMPurify from "isomorphic-dompurify";

// Sanitize admin-authored rich text on write. The TipTap editor (StarterKit +
// Link) already constrains output, but Server Actions are reachable as raw
// POSTs, so we re-clean to an allow-list of the tags the editor can emit. The
// stored HTML is later rendered with dangerouslySetInnerHTML (see RichText).
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "s", "u", "code", "pre",
  "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a",
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    // Only allow safe link protocols; blocks javascript:/data: URIs.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  });
}
