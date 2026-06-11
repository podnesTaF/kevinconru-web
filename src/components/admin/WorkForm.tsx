"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import { KINDS } from "@/lib/validation/schemas";
import { KIND_LABEL } from "@/lib/format";
import { WORKS } from "@/lib/works/config";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaView } from "@/components/admin/MediaUploader";

export type WorkVariant = "publication" | "press" | "exhibition";

export type WorkDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  subtitle?: string | null;
  body?: string;
  year?: number;
  // publication-only
  pages?: number | null;
  publisher?: string | null;
  kind?: string;
  coverBg?: string | null;
  coverFg?: string | null;
  featured?: boolean;
  // press-only
  outlet?: string;
  // exhibition-only
  venue?: string;
  // shared
  externalUrl?: string | null;
  published?: boolean;
  coverImage?: MediaView | null;
  pdf?: MediaView | null;
  galleryLayout?: string;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Friendly cover presets — clicking sets coverBg/coverFg, so the user never
// types CSS. (Publications only; press covers are just an image.)
const COVER_PRESETS: { label: string; bg: string; fg: string }[] = [
  { label: "Ink", bg: "linear-gradient(170deg, #2c2826 0%, #16151a 100%)", fg: "#efe9d8" },
  { label: "Espresso", bg: "linear-gradient(165deg, #6e6552 0%, #2a261d 100%)", fg: "#efe9d8" },
  { label: "Ocean", bg: "linear-gradient(180deg, #2a4858 0%, #0f1f28 100%)", fg: "#e8e2d2" },
  { label: "Forest", bg: "linear-gradient(170deg, #1a3d3a 0%, #08201e 100%)", fg: "#e0d6b9" },
  { label: "Terracotta", bg: "linear-gradient(170deg, #b85a30 0%, #6a2814 100%)", fg: "#f6efe0" },
  { label: "Sage", bg: "linear-gradient(180deg, #b3b89f 0%, #6e7556 100%)", fg: "#1a1814" },
  { label: "Ochre", bg: "linear-gradient(170deg, #c79a5a 0%, #6a4a22 100%)", fg: "#1a1814" },
];

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-rule bg-bg-alt p-4">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{title}</h2>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function WorkForm({
  variant,
  action,
  defaults = {},
  library,
  mode,
  belowBody,
}: {
  variant: WorkVariant;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: WorkDefaults;
  library: MediaView[];
  mode: "create" | "edit";
  // Rendered in the main column directly under the body (e.g. the gallery).
  // Kept outside the <form> element so its own forms aren't illegally nested.
  belowBody?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const FORM_ID = "work-form";
  const [title, setTitle] = useState(defaults.title ?? "");
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(defaults.slug));
  const [editingSlug, setEditingSlug] = useState(false);
  const [coverBg, setCoverBg] = useState(defaults.coverBg ?? "");
  const [coverFg, setCoverFg] = useState(defaults.coverFg ?? "#efe9d8");
  const [coverImage, setCoverImage] = useState<MediaView | null>(defaults.coverImage ?? null);
  const [advancedCover, setAdvancedCover] = useState(false);
  const fe = state.fieldErrors;

  const isPub = variant === "publication";
  const isPress = variant === "press";
  const cfg = WORKS[variant];
  const base = cfg.adminBase;
  const publicBase = cfg.publicBase;
  const noun = cfg.nounSingular;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      {/* Left column: main fields + gallery (gallery stays outside <form> to
          avoid nesting GalleryItemForm's own <form> elements). */}
      <div className="min-w-0 space-y-5">
        <form id={FORM_ID} action={formAction} className="space-y-5">
      {mode === "edit" && defaults.id && <input type="hidden" name="id" value={defaults.id} />}
        <div>
          <input
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            placeholder="Title"
            aria-label="Title"
            className="w-full border-0 border-b border-rule bg-transparent px-0 py-2 font-display text-3xl outline-none focus:border-terra"
          />
          <FieldError errors={fe?.title} />

          {/* Permalink line — slug is auto-derived; reveal to edit. */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-mono">
              {publicBase}/<span className="text-fg-soft">{slug || "…"}</span>
            </span>
            <button
              type="button"
              onClick={() => setEditingSlug((v) => !v)}
              className="text-fg-soft underline hover:text-terra"
            >
              {editingSlug ? "Done" : "Edit"}
            </button>
          </div>
          {editingSlug && (
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              className={`${inputCls} mt-2`}
            />
          )}
          {!editingSlug && <input type="hidden" name="slug" value={slug} />}
          <FieldError errors={fe?.slug} />
        </div>

        <div>
          <label className={labelCls}>{isPress ? "Source line / citation" : "Subtitle"}</label>
          <input
            name="subtitle"
            defaultValue={defaults.subtitle ?? ""}
            placeholder={isPress ? "Art & Antiques · Apr 2009, Vol. 32" : ""}
            className={inputCls}
          />
        </div>

        <div>
          <RichTextEditor name="body" label="Body — text and images, in any order" defaultValue={defaults.body ?? ""} />
          <FieldError errors={fe?.body} />
        </div>
        </form>
        {belowBody}
      </div>

      {/* ── Sidebar (fields associate with the main form via form=) ─ */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card title="Publish">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" form={FORM_ID} defaultChecked={defaults.published ?? true} />
            Published
          </label>
          {isPub && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" form={FORM_ID} defaultChecked={defaults.featured ?? false} />
              Featured on home
            </label>
          )}
          <FormMessage state={state} />
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <SubmitButton form={FORM_ID} pending={pending}>
              {mode === "create" ? `Create ${noun}` : "Save changes"}
            </SubmitButton>
            {mode === "edit" && defaults.id && (
              <a
                href={`/preview/${variant}/${defaults.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg-soft underline hover:text-terra"
              >
                Preview ↗
              </a>
            )}
            <Link href={base} className="text-sm text-muted hover:underline">
              Cancel
            </Link>
          </div>
          {mode === "edit" && (
            <p className="text-xs text-muted">Preview opens the last saved version in a new tab.</p>
          )}
        </Card>

        <Card title="Details">
          {isPub ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Year</label>
                  <input name="year" type="number" form={FORM_ID} defaultValue={defaults.year ?? ""} className={inputCls} />
                  <FieldError errors={fe?.year} />
                </div>
                <div>
                  <label className={labelCls}>Pages</label>
                  <input name="pages" type="number" form={FORM_ID} defaultValue={defaults.pages ?? ""} className={inputCls} />
                  <FieldError errors={fe?.pages} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Publisher</label>
                <input name="publisher" form={FORM_ID} defaultValue={defaults.publisher ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Kind</label>
                <select name="kind" form={FORM_ID} defaultValue={defaults.kind ?? "Monograph"} className={inputCls}>
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>{isPress ? "Outlet" : "Venue"}</label>
                <input
                  name={isPress ? "outlet" : "venue"}
                  form={FORM_ID}
                  defaultValue={(isPress ? defaults.outlet : defaults.venue) ?? ""}
                  placeholder={isPress ? "" : "Wereldmuseum Rotterdam"}
                  className={inputCls}
                />
                <FieldError errors={isPress ? fe?.outlet : fe?.venue} />
              </div>
              <div>
                <label className={labelCls}>Year</label>
                <input name="year" type="number" form={FORM_ID} defaultValue={defaults.year ?? ""} className={inputCls} />
                <FieldError errors={fe?.year} />
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>Gallery layout</label>
            <select name="galleryLayout" form={FORM_ID} defaultValue={defaults.galleryLayout ?? "Grid"} className={inputCls}>
              <option value="Grid">Grid — object plates with lightbox</option>
              <option value="List">Page by page — journal / article scans</option>
            </select>
            <p className="mt-1 text-xs text-muted">
              “Page by page” shows the images full-width, one after another — the friendly
              alternative to a PDF reader.
            </p>
          </div>
        </Card>

        <Card title="Cover" hint="Upload a cover image.">
          <CoverPreview coverImage={coverImage} bg={coverBg} fg={coverFg} title={title} isPub={isPub} />
          <MediaPicker
            name="coverImageId"
            form={FORM_ID}
            defaultMedia={coverImage}
            library={library}
            onChange={setCoverImage}
          />

          {isPub && (
            <>
              {!coverImage && (
                <div>
                  <div className="mb-2 text-xs text-muted">No image? Pick a colour:</div>
                  <div className="flex flex-wrap gap-2">
                    {COVER_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        title={p.label}
                        onClick={() => {
                          setCoverBg(p.bg);
                          setCoverFg(p.fg);
                        }}
                        aria-pressed={coverBg === p.bg}
                        className={
                          "h-7 w-7 rounded-full border " +
                          (coverBg === p.bg ? "border-terra ring-2 ring-terra" : "border-rule")
                        }
                        style={{ background: p.bg }}
                      />
                    ))}
                    <button
                      type="button"
                      title="None"
                      onClick={() => {
                        setCoverBg("");
                        setCoverFg("#efe9d8");
                      }}
                      aria-pressed={!coverBg}
                      className={
                        "flex h-7 w-7 items-center justify-center rounded-full border text-xs text-muted " +
                        (!coverBg ? "border-terra ring-2 ring-terra" : "border-rule")
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setAdvancedCover((v) => !v)}
                className="text-xs text-muted underline hover:text-fg"
              >
                {advancedCover ? "Hide advanced" : "Advanced (custom CSS)"}
              </button>
              {advancedCover && (
                <div className="space-y-2">
                  <input
                    value={coverBg}
                    onChange={(e) => setCoverBg(e.target.value)}
                    placeholder="linear-gradient(170deg, #2c2826, #16151a)"
                    className={inputCls}
                  />
                  <input
                    value={coverFg}
                    onChange={(e) => setCoverFg(e.target.value)}
                    placeholder="#efe9d8"
                    className={inputCls}
                  />
                </div>
              )}
              <input type="hidden" name="coverBg" form={FORM_ID} value={coverBg} />
              <input type="hidden" name="coverFg" form={FORM_ID} value={coverFg} />
            </>
          )}
        </Card>

        <Card title="Attachments" hint="Optional PDF and an external link.">
          <MediaPicker
            name="pdfId"
            form={FORM_ID}
            label={isPub ? "Book / scans PDF" : isPress ? "Article PDF" : "Catalogue / scans PDF"}
            defaultMedia={defaults.pdf ?? null}
            library={library}
            accept="application/pdf"
          />
          <div>
            <label className={labelCls}>External link</label>
            <input
              name="externalUrl"
              form={FORM_ID}
              defaultValue={defaults.externalUrl ?? ""}
              placeholder="https://…"
              className={inputCls}
            />
            <FieldError errors={fe?.externalUrl} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function CoverPreview({
  coverImage,
  bg,
  fg,
  title,
  isPub,
}: {
  coverImage: MediaView | null;
  bg: string;
  fg: string;
  title: string;
  isPub: boolean;
}) {
  const showGradient = isPub && !coverImage && bg;
  return (
    <div
      className="relative mx-auto flex aspect-[3/4] w-28 items-end overflow-hidden rounded border border-rule bg-bg p-2"
      style={showGradient ? { background: bg } : undefined}
    >
      {coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : showGradient ? (
        <span className="font-display text-sm leading-tight" style={{ color: fg }}>
          {title || "Cover"}
        </span>
      ) : (
        <span className="text-[10px] text-muted">No cover</span>
      )}
    </div>
  );
}
