import { cn } from "@/lib/cn";

// Renders admin-authored TipTap HTML. Content is sanitized on write by the
// Server Actions via `sanitizeHtml` (src/lib/sanitize.ts) before it is stored;
// styling lives in `.rich-text` (globals.css), tuned to the editorial type.
export default function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
