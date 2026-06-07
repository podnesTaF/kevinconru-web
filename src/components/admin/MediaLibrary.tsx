"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateAlt, deleteMedia } from "@/lib/actions/media";
import MediaUploader, { type MediaView } from "@/components/admin/MediaUploader";
import { inputCls } from "@/components/admin/ui";

function MediaCard({ media, onDeleted }: { media: MediaView; onDeleted: (id: string) => void }) {
  const [alt, setAlt] = useState(media.alt ?? "");
  const [, start] = useTransition();
  const [copied, setCopied] = useState(false);

  const isImage = media.mimeType.startsWith("image/");

  return (
    <div className="rounded-lg border border-rule bg-bg-alt p-3">
      <div className="relative mb-3 aspect-square overflow-hidden rounded bg-bg-alt">
        {isImage ? (
          <Image src={media.url} alt={media.alt ?? ""} fill className="object-contain" sizes="200px" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted">
            {media.mimeType}
          </span>
        )}
      </div>
      <div className="mb-2 text-xs text-muted">
        {media.width && media.height ? `${media.width}×${media.height} · ` : ""}
        {(media.bytes / 1024).toFixed(0)} KB
      </div>
      <div className="flex gap-1">
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="alt text"
          className={`${inputCls} text-xs`}
        />
        <button
          type="button"
          onClick={() => start(() => updateAlt(media.id, alt))}
          className="rounded-md bg-fg px-2 text-xs text-bg hover:bg-terra"
        >
          Save
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            const url = media.url.startsWith("http")
              ? media.url
              : `${window.location.origin}${media.url.startsWith("/") ? "" : "/"}${media.url}`;
            navigator.clipboard?.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="text-fg-soft hover:underline"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>
        <button
          type="button"
          onClick={() =>
            start(async () => {
              const res = await deleteMedia(media.id);
              if (!res.ok) window.alert(res.error);
              else onDeleted(media.id);
            })
          }
          className="text-terra-deep hover:text-terra"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function MediaLibrary({ initial }: { initial: MediaView[] }) {
  const [items, setItems] = useState<MediaView[]>(initial);

  return (
    <div className="space-y-6">
      <div className="max-w-md rounded-lg border border-rule bg-bg-alt p-4">
        <h2 className="mb-2 text-sm font-semibold">Upload</h2>
        <MediaUploader
          accept="image/*,application/pdf"
          onUploaded={(m) => setItems((prev) => [m, ...prev])}
        />
      </div>

      {items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <MediaCard key={m.id} media={m} onDeleted={(id) => setItems((p) => p.filter((x) => x.id !== id))} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No media yet.</p>
      )}
    </div>
  );
}
